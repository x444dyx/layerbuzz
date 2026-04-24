import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { StripeConnectButton } from '@/components/dashboard/stripe-connect-button'
import { ThemePicker } from '@/components/dashboard/theme-picker'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and store</p>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose how LayerBuzz looks for you. Your preference is saved to your account.</p>
        </div>
        <ThemePicker />
      </div>

      {/* Stripe Connect */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground mt-1">Connect Stripe to receive payouts from your sales</p>
        </div>
        <StripeConnectButton
          isConnected={profile?.stripe_onboarded || false}
          stripeAccountId={profile?.stripe_account_id || null}
        />
      </div>

      {/* Profile settings */}
      <SettingsForm profile={profile} />
    </div>
  )
}
