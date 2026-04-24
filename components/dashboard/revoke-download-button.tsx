'use client'

import { useState } from 'react'
import { Ban, Loader2 } from 'lucide-react'

export function RevokeDownloadButton({ orderId, isRevoked }: { orderId: string; isRevoked: boolean }) {
  const [revoked, setRevoked] = useState(isRevoked)
  const [loading, setLoading] = useState(false)

  const handleRevoke = async () => {
    if (!confirm(revoked ? 'Restore download access for this order?' : 'Revoke download access for this order? The buyer will no longer be able to download the file.')) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders/revoke-download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId, revoke: !revoked }),
      })
      if (res.ok) setRevoked(!revoked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      title={revoked ? 'Restore download access' : 'Revoke download access'}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
        revoked
          ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
          : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
      }`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
      {revoked ? 'Restore' : 'Revoke'}
    </button>
  )
}
