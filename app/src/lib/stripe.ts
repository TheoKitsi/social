import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

/** Convenience alias */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/** Map DB plan tiers to Stripe price IDs (set in Stripe Dashboard) */
export const PLAN_PRICE_IDS: Record<
  string,
  { monthly: string; annually: string }
> = {
  essentials: {
    monthly: process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY || "",
    annually: process.env.STRIPE_PRICE_ESSENTIALS_ANNUAL || "",
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
    annually: process.env.STRIPE_PRICE_PREMIUM_ANNUAL || "",
  },
  elite: {
    monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY || "",
    annually: process.env.STRIPE_PRICE_ELITE_ANNUAL || "",
  },
};
