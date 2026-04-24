import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLATFORM_FEE_PERCENT = 3

export function calculateFees(amountInPence: number) {
  const platformFee = Math.round(amountInPence * (PLATFORM_FEE_PERCENT / 100))
  const sellerAmount = amountInPence - platformFee
  return { platformFee, sellerAmount }
}
