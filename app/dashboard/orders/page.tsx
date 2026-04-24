'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingBag, Download, ChevronDown } from 'lucide-react'
import { RevokeDownloadButton } from '@/components/dashboard/revoke-download-button'

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  refunded: 'bg-red-500/10 text-red-400 border border-red-500/20',
  disputed: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
}

export default function OrdersPage() {

  useEffect(() => { document.title = 'Orders | LayerBuzz' }, [])

  const [orders, setOrders] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [products, setProducts] = useState<{ id: string; title: string }[]>([])
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('orders')
        .select('*, product:products(id, title, cover_image_url)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data)
        setFiltered(data)

        // Build unique product list from orders
        const seen = new Set()
        const productList: { id: string; title: string }[] = []
        data.forEach((o: any) => {
          if (o.product?.id && !seen.has(o.product.id)) {
            seen.add(o.product.id)
            productList.push({ id: o.product.id, title: o.product.title })
          }
        })
        setProducts(productList)
      }
      setLoading(false)
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    let result = orders
    if (selectedProduct !== 'all') {
      result = result.filter((o: any) => o.product?.id === selectedProduct)
    }
    if (selectedStatus !== 'all') {
      result = result.filter((o: any) => o.status === selectedStatus)
    }
    setFiltered(result)
  }, [selectedProduct, selectedStatus, orders])

  const selectedProductLabel = selectedProduct === 'all'
    ? 'All products'
    : products.find(p => p.id === selectedProduct)?.title || 'All products'

  const selectedStatusLabel = selectedStatus === 'all' ? 'All statuses' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} of {orders.length} orders
          </p>
        </div>

        {/* Filters */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Product filter */}
            <div className="relative">
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setStatusDropdownOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors text-sm"
              >
                <span className="max-w-[140px] truncate">{selectedProductLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => { setSelectedProduct('all'); setDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors ${selectedProduct === 'all' ? 'text-violet-400' : ''}`}
                  >
                    All products
                  </button>
                  {products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProduct(p.id); setDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors truncate ${selectedProduct === p.id ? 'text-violet-400' : ''}`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setDropdownOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors text-sm"
              >
                <span>{selectedStatusLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {['all', 'completed', 'pending', 'refunded', 'disputed'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelectedStatus(s); setStatusDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors capitalize ${selectedStatus === s ? 'text-violet-400' : ''}`}
                    >
                      {s === 'all' ? 'All statuses' : s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border p-16 text-center">
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground">Share your store to start getting sales</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No orders match this filter</h3>
          <p className="text-sm text-muted-foreground">Try a different product or status</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Buyer</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden lg:table-cell">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden lg:table-cell">Downloads</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium">{order.buyer_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.buyer_email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {order.product?.cover_image_url
                          ? <img src={order.product.cover_image_url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20" />}
                      </div>
                      <span className="text-sm truncate max-w-[160px]">{order.product?.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold">{formatCurrency(order.seller_amount)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(order.amount)}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="w-3.5 h-3.5" />
                      {order.download_count}/{order.max_downloads}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RevokeDownloadButton
                      orderId={order.id}
                      isRevoked={order.max_downloads === 0}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
