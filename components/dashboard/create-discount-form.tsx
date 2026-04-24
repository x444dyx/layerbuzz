'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Loader2 } from 'lucide-react'

export function CreateDiscountForm({ products }: { products: any[] }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('')
  const [productId, setProductId] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !value) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('discount_codes').insert({
      seller_id: user.id,
      code: code.toUpperCase().trim(),
      discount_type: type,
      discount_value: parseFloat(value),
      product_id: productId || null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt || null,
    })

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Discount code created!' })
      setOpen(false)
      setCode(''); setValue(''); setProductId(''); setMaxUses(''); setExpiresAt('')
      router.refresh()
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Create discount code
      </Button>
    )
  }

  return (
    <form onSubmit={handleCreate} className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <h2 className="font-semibold">New discount code</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Code *</Label>
          <Input placeholder="e.g. LAUNCH20" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <select
            value={type}
            onChange={e => setType(e.target.value as 'percent' | 'fixed')}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed amount (£)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Value *</Label>
          <Input
            type="number"
            min="0"
            max={type === 'percent' ? 100 : undefined}
            step="0.01"
            placeholder={type === 'percent' ? '20' : '5.00'}
            value={value}
            onChange={e => setValue(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Apply to</Label>
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Max uses (optional)</Label>
          <Input type="number" min="1" placeholder="Unlimited" value={maxUses} onChange={e => setMaxUses(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Expires at (optional)</Label>
          <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" variant="gradient" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create code'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  )
}
