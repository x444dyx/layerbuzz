import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Eye, DollarSign } from 'lucide-react'

export const metadata = { title: 'Analytics' }


export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, ordersRes, productsRes, eventsRes] = await Promise.all([
    supabase.from('profiles').select('total_revenue, total_sales').eq('id', user.id).single(),
    supabase.from('orders').select('amount, seller_amount, created_at, status').eq('seller_id', user.id).eq('status', 'completed').order('created_at', { ascending: true }),
    supabase.from('products').select('id, title, sales_count, view_count, price, is_free').eq('seller_id', user.id).eq('is_deleted', false).order('sales_count', { ascending: false }),
    supabase.from('analytics_events').select('event_type, created_at').eq('seller_id', user.id),
  ])

  const profile = profileRes.data
  const orders = ordersRes.data || []
  const products = productsRes.data || []
  const events = eventsRes.data || []

  // Monthly revenue last 6 months
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      label: d.toLocaleString('en-GB', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      revenue: 0,
      sales: 0,
    }
  })

  orders.forEach((order) => {
    const d = new Date(order.created_at)
    const month = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth())
    if (month) {
      month.revenue += order.seller_amount
      month.sales += 1
    }
  })

  const maxRevenue = Math.max(...months.map(m => m.revenue), 1)
  const totalViews = events.filter(e => e.event_type === 'view').length

  const conversionRate = totalViews > 0 ? ((profile?.total_sales || 0) / totalViews * 100).toFixed(1) : '0.0'

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Your store performance at a glance</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(profile?.total_revenue || 0), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Total Sales', value: (profile?.total_sales || 0).toString(), icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Product Views', value: totalViews.toString(), icon: Eye, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Conversion', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-6">Revenue (last 6 months)</h2>
        <div className="flex items-end gap-3 h-40">
          {months.map((month) => (
            <div key={`${month.year}-${month.month}`} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatCurrency(month.revenue, 'gbp').replace('£', '£')}</span>
              <div className="w-full relative flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                  style={{ height: `${(month.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{month.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Top products</h2>
        </div>
        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No products yet</div>
        ) : (
          <div className="divide-y divide-border">
            {products.slice(0, 10).map((product, i) => (
              <div key={product.id} className="flex items-center gap-4 px-5 py-4">
                <span className="text-sm font-mono text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.view_count || 0} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{product.sales_count} sales</p>
                  <p className="text-xs text-muted-foreground">
                    {product.is_free ? 'Free' : formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
