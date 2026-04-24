import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, ShoppingBag, TrendingUp, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Dashboard' }


export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, productsRes, ordersRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('products').select('*').eq('seller_id', user.id).eq('is_deleted', false).order('created_at', { ascending: false }),
    supabase.from('orders').select('*, product:products(title, cover_image_url)').eq('seller_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(5),
  ])

  const profile = profileRes.data
  const products = productsRes.data || []
  const recentOrders = ordersRes.data || []

  const totalRevenue = profile?.total_revenue || 0
  const totalSales = profile?.total_sales || 0
  const publishedProducts = products.filter(p => p.is_published).length

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Sales', value: totalSales.toString(), icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Products', value: publishedProducts.toString(), icon: Package, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Avg. Order', value: totalSales > 0 ? formatCurrency(totalRevenue / totalSales) : '£0', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {profile?.display_name || profile?.username} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Recent orders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">View all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <p className="text-xs text-muted-foreground mt-1">Share your store to start selling</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-violet-600">
                    {order.buyer_name?.[0]?.toUpperCase() || order.buyer_email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.buyer_name || order.buyer_email}</p>
                    <p className="text-xs text-muted-foreground truncate">{(order.product as any)?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(order.seller_amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        <div className="bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Your products</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/products">View all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </div>
          {products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No products yet</p>
              <Button size="sm" variant="gradient" className="mt-3" asChild>
                <Link href="/dashboard/products/new">Create your first product</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {product.cover_image_url
                      ? <img src={product.cover_image_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.sales_count} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {product.is_free ? 'Free' : formatCurrency(product.price)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                      {product.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick setup if new user */}
      {products.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-xl font-semibold mb-2">Ready to make your first sale?</h2>
            <p className="text-white/80 mb-6 max-w-md">Upload your first product. It takes less than 2 minutes and you keep 97% of every sale.</p>
            <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90" asChild>
              <Link href="/dashboard/products/new">Create a product</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
