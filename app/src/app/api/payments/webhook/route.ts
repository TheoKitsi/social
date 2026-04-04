import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (!userId || !session.subscription) break;

      const subResponse = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const subscription = subResponse as Stripe.Subscription;
      const tier =
        subscription.metadata?.plan_tier || "essentials";
      const billingInterval =
        subscription.metadata?.billing_interval || "monthly";

      // Look up plan ID
      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("tier", tier)
        .single();

      if (plan) {
        const firstItem = subscription.items?.data?.[0];
        await supabase.from("user_subscriptions").upsert(
          {
            user_id: userId,
            plan_id: plan.id,
            status: subscription.status === "trialing" ? "trial" : "active",
            billing_interval: billingInterval,
            trial_started_at: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            current_period_start: firstItem
              ? new Date(firstItem.current_period_start * 1000).toISOString()
              : new Date().toISOString(),
            current_period_end: firstItem
              ? new Date(firstItem.current_period_end * 1000).toISOString()
              : new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      const statusMap: Record<string, string> = {
        trialing: "trial",
        active: "active",
        past_due: "past_due",
        canceled: "canceled",
        unpaid: "expired",
      };

      const firstItem = subscription.items?.data?.[0];
      const updateData: Record<string, unknown> = {
        status: statusMap[subscription.status] || "active",
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
      };

      if (firstItem) {
        updateData.current_period_start = new Date(
          firstItem.current_period_start * 1000
        ).toISOString();
        updateData.current_period_end = new Date(
          firstItem.current_period_end * 1000
        ).toISOString();
      }

      await supabase
        .from("user_subscriptions")
        .update(updateData)
        .eq("user_id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase
        .from("user_subscriptions")
        .update({ status: "expired" })
        .eq("user_id", userId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.subscription_details;
      const subId =
        typeof subDetails?.subscription === "string"
          ? subDetails.subscription
          : subDetails?.subscription?.id;
      if (!subId) break;

      const subRes = await stripe.subscriptions.retrieve(subId);
      const subscription = subRes as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase
        .from("user_subscriptions")
        .update({ status: "past_due" })
        .eq("user_id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
