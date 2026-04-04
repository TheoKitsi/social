import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_PRICE_IDS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "payments-checkout", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tier, billing } = body as {
    tier: string;
    billing: "monthly" | "annually";
  };

  if (!tier || !billing || !PLAN_PRICE_IDS[tier]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = PLAN_PRICE_IDS[tier][billing];
  if (!priceId) {
    return NextResponse.json(
      { error: "Price not configured" },
      { status: 500 }
    );
  }

  // Get or create Stripe customer
  let customerId: string;
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (profile?.stripe_customer_id) {
    customerId = profile.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/en/subscription?success=true`,
    cancel_url: `${appUrl}/en/plans?canceled=true`,
    subscription_data: {
      trial_period_days: 3,
      metadata: {
        supabase_user_id: user.id,
        plan_tier: tier,
        billing_interval: billing,
      },
    },
    metadata: {
      supabase_user_id: user.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
