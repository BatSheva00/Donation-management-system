import Stripe from "stripe";
import { AppError } from "../shared/utils/AppError";

let stripeInstance: Stripe | null = null;

/** Lazy init so the API can start without Stripe (Atlas-only local dev). */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new AppError(
      "Payment processing is not configured. Set STRIPE_SECRET_KEY in backend/.env.",
      503
    );
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }
  return stripeInstance;
}
