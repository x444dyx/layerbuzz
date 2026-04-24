'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Tag, Loader2, Trash2, Pencil, X, Check } from 'lucide-react'
import { CreateDiscountForm } from '@/components/dashboard/create-discount-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchDiscounts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [discountsRes, productsRes] = await Promise.all([
      supabase.from('discount_codes').select('*, product:products(title)').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('products').select('id, title').eq('seller_id', user.id).eq('is_deleted', false),
    ])
    setDiscounts(discountsRes.data || [])
    setProducts(productsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDiscounts() }, [])

  const handleAction = async (action: string, id: string, data?: any) => {
    setActionLoading(id + action)
    try {
      const res = await fetch('/api/discounts/actions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, id, data }),
      })
      const result = await res.json()
      if (action === 'delete') {
        setDiscounts(prev => prev.filter(d => d.id !== id))
        toast({ title: 'Discount deleted' })
      } else if (result.discount) {
        setDiscounts(prev => prev.map(d => d.id === id ? { ...d, ...result.discount } : d))
        toast({ title: action === 'toggle' ? (result.discount.is_active ? 'Discount activated' : 'Discount deactivated') : 'Discount updated' })
        setEditingId(null)
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
    setActionLoading(null)
  }

  const startEdit = (d: any) => {
    setEditingId(d.id)
    setEditForm({
      code: d.code,
      discount_type: d.discount_type,
      discount_value: d.discount_value,
      max_uses: d.max_uses || '',
      expires_at: d.expires_at ? d.expires_at.split('T')[0] : '',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Discount codes</h1>
        <p className="text-muted-foreground text-sm mt-1">Create codes to offer deals to your buyers</p>
      </div>

      <CreateDiscountForm products={products} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : discounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No discount codes yet</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Code</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Discount</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Uses</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden lg:table-cell">Expires</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discounts.map((d: any) => (
                <>
                  <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded-lg font-mono">{d.code}</code>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold">
                        {d.discount_type === 'percent' ? `${d.discount_value}%` : `£${d.discount_value}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{d.product?.title || 'All products'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm">{d.uses_count}{d.max_uses ? `/${d.max_uses}` : ''}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{d.expires_at ? formatDate(d.expires_at) : 'Never'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleAction('toggle', d.id, { is_active: !d.is_active })}
                        disabled={actionLoading === d.id + 'toggle'}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${d.is_active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      >
                        {actionLoading === d.id + 'toggle' ? <Loader2 className="w-3 h-3 animate-spin" /> : d.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(d)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/30"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete code "${d.code}"?`)) handleAction('delete', d.id) }}
                          disabled={actionLoading === d.id + 'delete'}
                          className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                          title="Delete"
                        >
                          {actionLoading === d.id + 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Edit row */}
                  {editingId === d.id && (
                    <tr key={d.id + '-edit'} className="bg-muted/10 border-b border-border">
                      <td colSpan={7} className="px-5 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Code</label>
                            <Input value={editForm.code} onChange={e => setEditForm((p: any) => ({ ...p, code: e.target.value.toUpperCase() }))} className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Value</label>
                            <div className="flex gap-1">
                              <select
                                value={editForm.discount_type}
                                onChange={e => setEditForm((p: any) => ({ ...p, discount_type: e.target.value }))}
                                className="h-8 text-sm rounded-lg border border-border bg-background px-2"
                              >
                                <option value="percent">%</option>
                                <option value="fixed">£</option>
                              </select>
                              <Input value={editForm.discount_value} onChange={e => setEditForm((p: any) => ({ ...p, discount_value: e.target.value }))} className="h-8 text-sm" type="number" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Max uses</label>
                            <Input value={editForm.max_uses} onChange={e => setEditForm((p: any) => ({ ...p, max_uses: e.target.value }))} className="h-8 text-sm" type="number" placeholder="Unlimited" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Expires</label>
                            <Input value={editForm.expires_at} onChange={e => setEditForm((p: any) => ({ ...p, expires_at: e.target.value }))} className="h-8 text-sm" type="date" />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="gradient" onClick={() => handleAction('edit', d.id, editForm)} disabled={actionLoading === d.id + 'edit'}>
                            {actionLoading === d.id + 'edit' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="w-3 h-3" /> Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
