import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Globe, Package } from 'lucide-react'
import { ThemeApplier } from '@/components/providers/theme-applier'

const SOCIAL_URLS: Record<string, (val: string) => string> = {
  twitter: (v) => `https://twitter.com/${v}`,
  instagram: (v) => `https://instagram.com/${v}`,
  tiktok: (v) => `https://tiktok.com/@${v}`,
  youtube: (v) => v.startsWith('http') ? v : `https://youtube.com/${v}`,
  linkedin: (v) => v.startsWith('http') ? v : `https://linkedin.com/in/${v}`,
  facebook: (v) => v.startsWith('http') ? v : `https://facebook.com/${v}`,
  twitch: (v) => `https://twitch.tv/${v}`,
  discord: (v) => v.startsWith('http') ? v : `https://discord.gg/${v}`,
  spotify: (v) => v.startsWith('http') ? v : `https://open.spotify.com/${v}`,
  soundcloud: (v) => v.startsWith('http') ? v : `https://soundcloud.com/${v}`,
  github: (v) => `https://github.com/${v}`,
  threads: (v) => `https://threads.net/@${v}`,
}

const SOCIAL_LABELS: Record<string, string> = {
  twitter: 'X', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube',
  linkedin: 'LinkedIn', facebook: 'Facebook', twitch: 'Twitch', discord: 'Discord',
  spotify: 'Spotify', soundcloud: 'SoundCloud', github: 'GitHub', threads: 'Threads',
}

export const metadata = { title: 'Store' }


export default async function SellerStorePage({ params }: { params: { username: string } }) {
  const supabase = createClient()

  const { data: seller } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!seller) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', seller.id)
    .eq('is_published', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen">
      <ThemeApplier sellerTheme={seller.theme || 'midnight'} />
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Seller header */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-12 pb-12 border-b border-border">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
            {seller.avatar_url
              ? <img src={seller.avatar_url} alt={seller.display_name || seller.username} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-semibold">
                  {seller.display_name?.[0]?.toUpperCase() || seller.username[0].toUpperCase()}
                </div>
            }
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{seller.display_name || seller.username}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">@{seller.username}</p>
            {seller.bio && <p className="text-sm mt-2 max-w-lg">{seller.bio}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {seller.website && (
                <a href={seller.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {(seller.social_links || []).filter((s: any) => s.value).map((s: any) => (
                <a
                  key={s.platform}
                  href={SOCIAL_URLS[s.platform]?.(s.value) || s.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {SOCIAL_LABELS[s.platform] || s.platform}
                </a>
              ))}
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-semibold">{products?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{seller.total_sales || 0}</p>
              <p className="text-xs text-muted-foreground">Sales</p>
            </div>
          </div>
        </div>

        {/* Products grid */}
        {!products || products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/p/${seller.username}/${product.slug}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {product.cover_image_url
                    ? <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-4xl">{PRODUCT_CATEGORIES.find(c => c.value === product.category)?.emoji || '✨'}</span>
                      </div>
                  }
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">{product.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{product.is_free ? <span className="text-emerald-600">Free</span> : formatCurrency(product.price)}</span>
                    {product.sales_count > 0 && <span className="text-xs text-muted-foreground">{product.sales_count} sold</span>}
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
