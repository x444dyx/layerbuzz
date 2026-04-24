'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function TogglePublishButton({ productId, isPublished }: { productId: string; isPublished: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const toggle = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('products')
      .update({ is_published: !isPublished })
      .eq('id', productId)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: isPublished ? 'Product unpublished' : 'Product is now live!' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} disabled={loading} title={isPublished ? 'Unpublish' : 'Publish'}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </Button>
  )
}
