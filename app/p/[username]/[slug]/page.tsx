import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { BuyButton } from '@/components/store/buy-button'
import { Star, ShoppingBag, FileIcon, Globe } from 'lucide-react'

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

export const metadata = { title: 'Product' }


export default async function ProductPage({
  params,
}: {
  params: { username: string; slug: string }
}) {
  const supabase = createClient()

  // Find seller by username first
  const { data: seller } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!seller) notFound()

  // Find product by slug + seller
  const { data: product } = await supabase
    .from('products')
    .select('*, seller:profiles(*), files:product_files(*), reviews(*)')
    .eq('slug', params.slug)
    .eq('seller_id', seller.id)
    .eq('is_published', true)
    .eq('is_deleted', false)
    .single()

  if (!product) notFound()

  // Track view
  await supabase.from('analytics_events').insert({
    product_id: product.id,
    seller_id: product.seller_id,
    event_type: 'view',
  })
  await supabase
    .from('products')
    .update({ view_count: (product.view_count || 0) + 1 })
    .eq('id', product.id)

  const files = product.files as any[]
  const reviews = product.reviews as any[]
  const category = PRODUCT_CATEGORIES.find(c => c.value === product.category)

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left — product info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover */}
            {product.cover_image_url ? (
              <div className="rounded-2xl overflow-hidden aspect-video">
                <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl aspect-video bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center border border-border">
                <span className="text-7xl">{category?.emoji || '✨'}</span>
              </div>
            )}

            {/* Title & meta */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-muted px-2.5 py-1 rounded-full">{category?.emoji} {category?.label}</span>
                {product.rating_count > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {product.rating_avg.toFixed(1)} ({product.rating_count})
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-display font-semibold mb-3">{product.title}</h1>
              <div className="flex items-center gap-3">
                <Link href={`/store/${seller.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                    {seller.avatar_url
                      ? <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                          {seller.display_name?.[0]?.toUpperCase() || seller.username[0].toUpperCase()}
                        </div>
                    }
                  </div>
                  <span className="text-sm text-muted-foreground">{seller.display_name || seller.username}</span>
                </Link>
                {product.sales_count > 0 && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" /> {product.sales_count} sold
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold mb-3">About this product</h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm">{product.description}</div>
              </div>
            )}

            {/* What's included */}
            {files && files.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">What&apos;s included</h2>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                      <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1">{file.name}</span>
                      {file.file_size && (
                        <span className="text-xs text-muted-foreground">
                          {(file.file_size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl border border-border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.buyer_name || 'Verified buyer'}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{formatDate(review.created_at)}</span>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — buy card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-3xl font-semibold">
                    {product.is_free ? <span className="text-emerald-400">Free</span> : formatCurrency(product.price)}
                  </p>
                  {!product.is_free && (
                    <p className="text-xs text-muted-foreground mt-1">One-time payment, instant download</p>
                  )}
                </div>

                <BuyButton product={product} cta={product.custom_cta || undefined} />

                <div className="text-xs text-muted-foreground space-y-1.5">
                  <p>✓ Secure payment via Stripe</p>
                  <p>✓ Instant download after purchase</p>
                  <p>✓ {product.max_downloads || 5} download attempts</p>
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Seller</p>
                <Link href={`/store/${seller.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    {seller.avatar_url
                      ? <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                          {seller.display_name?.[0]?.toUpperCase() || seller.username[0].toUpperCase()}
                        </div>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">{seller.display_name || seller.username}</p>
                    <p className="text-xs text-muted-foreground">{seller.total_sales || 0} sales</p>
                  </div>
                </Link>
                {seller.bio && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{seller.bio}</p>}
                <div className="flex flex-wrap gap-3 mt-3">
                  {seller.website && (
                    <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
