import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/types'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Search } from 'lucide-react'

export const metadata = { title: 'Browse Store' }


export default async function StorePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const supabase = createClient()
  const q = searchParams.q || ''
  const category = searchParams.category || ''

  let query = supabase
    .from('products')
    .select('*, seller:profiles(username, display_name, avatar_url)')
    .eq('is_published', true)
    .eq('is_deleted', false)
    .order('sales_count', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)
  if (category) query = query.eq('category', category)

  const { data: products } = await query.limit(60)

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-display mb-2">Browse products</h1>
          <p className="text-muted-foreground">Discover digital products from independent creators</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 h-11 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/store"
              className={`px-3 py-2 rounded-xl text-sm border transition-colors ${!category ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-muted'}`}
            >
              All
            </Link>
            {PRODUCT_CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.value}
                href={`/store?category=${cat.value}`}
                className={`px-3 py-2 rounded-xl text-sm border transition-colors ${category === cat.value ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-muted'}`}
              >
                {cat.emoji} {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {!products || products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/p/${(product.seller as any)?.username}/${product.slug}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Cover */}
                <div className="aspect-video bg-muted overflow-hidden">
                  {product.cover_image_url
                    ? <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-3xl">{PRODUCT_CATEGORIES.find(c => c.value === product.category)?.emoji || '✨'}</span>
                      </div>
                  }
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-violet-600 transition-colors">{product.title}</p>
                  <p className="text-xs text-muted-foreground mb-3">by {(product.seller as any)?.display_name || (product.seller as any)?.username}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {product.is_free ? <span className="text-emerald-600">Free</span> : formatCurrency(product.price)}
                    </span>
                    {product.sales_count > 0 && (
                      <span className="text-xs text-muted-foreground">{product.sales_count} sold</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
