'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ShieldOff, ShieldCheck, Loader2 } from 'lucide-react'

export function RevokeLicenceButton({
  licenceId,
  isRevoked,
  buyerEmail,
}: {
  licenceId: string
  isRevoked: boolean
  buyerEmail: string
}) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleToggle = async () => {
    if (!isRevoked && !confirm) {
      setConfirm(true)
      return
    }

    setLoading(true)
    const newStatus = isRevoked ? 'active' : 'revoked'

    const { error } = await supabase
      .from('licence_keys')
      .update({ status: newStatus })
      .eq('id', licenceId)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: isRevoked ? 'Licence reinstated' : 'Licence revoked',
        description: isRevoked
          ? `${buyerEmail} can use this key again`
          : `${buyerEmail} can no longer use this key`,
      })
      router.refresh()
    }

    setLoading(false)
    setConfirm(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      onBlur={() => setTimeout(() => setConfirm(false), 200)}
      disabled={loading}
      className={
        confirm
          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs'
          : isRevoked
          ? 'text-emerald-400 hover:text-emerald-300 text-xs'
          : 'text-muted-foreground hover:text-red-400 text-xs'
      }
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isRevoked ? (
        <><ShieldCheck className="w-3.5 h-3.5" /> Reinstate</>
      ) : confirm ? (
        <><ShieldOff className="w-3.5 h-3.5" /> Confirm revoke</>
      ) : (
        <><ShieldOff className="w-3.5 h-3.5" /> Revoke</>
      )}
    </Button>
  )
}
