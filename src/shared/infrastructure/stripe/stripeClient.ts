import Stripe from "stripe";

import { requireNonEmptyEnv } from "@/shared/errors/programmingError";

/**
 * Lazily-initialized Stripe SDK instance.
 * Uses the server-only STRIPE_SECRET_KEY environment variable.
 *
 * @throws ProgrammingError if STRIPE_SECRET_KEY is not configured
 */
export const getStripeClient = (): Stripe => {
  const secretKey = requireNonEmptyEnv(
    process.env.STRIPE_SECRET_KEY,
    "STRIPE_SECRET_KEY is not configured. " +
      "Please add it to your .env.local file. " +
      "You can find it in your Stripe Dashboard: Developers → API keys"
  );

  return new Stripe(secretKey, {
    typescript: true,
  });
};
