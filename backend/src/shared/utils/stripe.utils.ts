/**
 * Calculate Stripe fees based on US pricing
 * Standard rate: 2.9% + $0.30 per successful charge
 *
 * @param amount - Gross amount in dollars
 * @returns Object with gross, fee, and net amounts
 */
export const calculateStripeFees = (
  amount: number
): {
  grossAmount: number;
  fee: number;
  netAmount: number;
} => {
  const STRIPE_PERCENTAGE = 0.029; // 2.9%
  const STRIPE_FIXED_FEE = 0.3; // $0.30

  const grossAmount = amount;
  const fee =
    Math.round((amount * STRIPE_PERCENTAGE + STRIPE_FIXED_FEE) * 100) / 100; // Round to 2 decimals
  const netAmount = Math.round((amount - fee) * 100) / 100; // Round to 2 decimals

  return {
    grossAmount,
    fee,
    netAmount,
  };
};



