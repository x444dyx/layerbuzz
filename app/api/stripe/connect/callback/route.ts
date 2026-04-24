import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('account_id')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!accountId) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings?stripe=error`)
  }

  try {
    const supabase = createClient()
    const account = await stripe.accounts.retrieve(accountId)

    const isOnboarded =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted

    await supabase
      .from('profiles')
      .update({
        stripe_account_id: accountId,
        stripe_onboarded: isOnboarded,
      })
      .eq('stripe_account_id', accountId)

    return NextResponse.redirect(
      `${appUrl}/dashboard/settings?stripe=${isOnboarded ? 'connected' : 'pending'}`
    )
  } catch (err: any) {
    console.error('Stripe callback error:', err)
    return NextResponse.redirect(`${appUrl}/dashboard/settings?stripe=error`)
  }
}
