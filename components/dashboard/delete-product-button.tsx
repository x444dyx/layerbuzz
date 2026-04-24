'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return }
    setLoading(true)
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true })
      .eq('id', productId)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Product deleted' })
      router.refresh()
    }
    setLoading(false)
    setConfirm(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      onBlur={() => setTimeout(() => setConfirm(false), 200)}
      className={confirm ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-muted-foreground'}
      title={confirm ? 'Click again to confirm' : 'Delete product'}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}
