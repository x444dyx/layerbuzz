'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

export function StripeConnectButton({
  isConnected,
  stripeAccountId,
}: {
  isConnected: boolean
  stripeAccountId: string | null
}) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
          Stripe connected — you&apos;re ready to receive payments
        </div>
        <Button variant="outline" size="sm" onClick={handleConnect} disabled={loading}>
          <ExternalLink className="w-4 h-4" /> Manage
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        ⚠️ You need to connect Stripe before you can receive payments from sales.
      </div>
      <Button onClick={handleConnect} disabled={loading} variant="gradient">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Connect with Stripe
      </Button>
    </div>
  )
}
