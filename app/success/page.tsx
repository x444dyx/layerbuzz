import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { CheckCircle2, Download, ArrowRight, Mail, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeApplier } from '@/components/providers/theme-applier'

export const metadata = { title: 'Purchase Complete' }

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Invalid session.</p>
        </div>
      </main>
    )
  }

  let order = null
  let product = null
  let downloadToken = null
  let licenceKey = null
  let productType = 'file'

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Use service role to bypass RLS
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: orderData } = await supabase
      .from('orders')
      .select('*, product:products(title, cover_image_url, thank_you_message, slug, product_type, seller:profiles(username))')
      .eq('stripe_payment_intent_id', session.payment_intent as string)
      .single()

    if (orderData) {
      order = orderData
      product = {
        ...(orderData.product as any),
        seller_username: (orderData.product as any)?.seller?.username,
      }
      downloadToken = orderData.download_token
      productType = (orderData.product as any)?.product_type || 'file'

      // If licence product, fetch the licence key
      if (productType === 'licence') {
        const { data: licenceData } = await supabase
          .from('licence_keys')
          .select('key')
          .eq('order_id', orderData.id)
          .single()
        if (licenceData) licenceKey = licenceData.key
      }
    }
  } catch (err) {
    console.error('Success page error:', err)
  }

  const isLicence = productType === 'licence'

  return (
    <main className="min-h-screen bg-background">
      <ThemeApplier forcedTheme="midnight" />
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-6 py-32">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">

          {/* Success icon */}
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-emerald-400 animate-ping opacity-20" />
          </div>

          {/* Message */}
          <div>
            <h1 className="text-3xl font-display font-semibold mb-3">
              Purchase complete!
            </h1>
            {product ? (
              <p className="text-muted-foreground">
                You&apos;ve got <strong>{product.title}</strong>.{' '}
                {isLicence ? 'Your licence key is below.' : 'Your download is ready.'}
              </p>
            ) : (
              <p className="text-muted-foreground">Thank you for your purchase.</p>
            )}
            {product?.thank_you_message && (
              <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-left text-foreground">
                {product.thank_you_message}
              </div>
            )}
          </div>

          {/* Licence key */}
          {isLicence && (
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Key className="w-4 h-4 text-violet-400" />
                  Your licence key
                </div>
                {licenceKey ? (
                  <div className="bg-muted/50 rounded-xl px-4 py-3 font-mono text-sm text-center tracking-widest text-foreground select-all">
                    {licenceKey}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm text-center text-muted-foreground">
                    Your key is being generated...
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {order?.buyer_email
                    ? `Also sent to ${order.buyer_email}`
                    : 'Also sent to your email'}
                </p>
              </div>
            </div>
          )}

          {/* Download button for file products */}
          {!isLicence && downloadToken && (
            <div className="space-y-3">
              <Button size="lg" variant="gradient" className="w-full group" asChild>
                <a href={`/download/${downloadToken}`}>
                  <Download className="w-4 h-4" />
                  Download your files
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              {order?.buyer_email && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  A download link has been sent to {order.buyer_email}
                </p>
              )}
            </div>
          )}

          {/* Order summary */}
          {order && (
            <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Order summary</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount paid</span>
                <span className="font-semibold">{formatCurrency(order.amount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span>{order.buyer_email}</span>
              </div>
              {!isLicence && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Download attempts</span>
                  <span>{order.max_downloads}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            {product?.slug && (
              <Button variant="outline" asChild>
                <Link href={`/p/${product.seller_username}/${product.slug}`}>
                  Back to product
                </Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/store">Browse more products</Link>
            </Button>
          </div>

        </div>
      </div>
    </main>
  )
}
