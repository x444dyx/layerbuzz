import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Button } from '@/components/ui/button'
import { Download, FileIcon, ArrowRight } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import { ThemeApplier } from '@/components/providers/theme-applier'

export const metadata = { title: 'Download' }


export const dynamic = 'force-dynamic'

export default async function DownloadPage({ params }: { params: { token: string } }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const { data: order } = await supabase
    .from('orders')
    .select('*, product:products(id, title, cover_image_url, thank_you_message, files:product_files(*))')
    .eq('download_token', params.token)
    .eq('status', 'completed')
    .single()

  if (!order) notFound()

  const product = order.product as any
  const files = product?.files as any[] || []
  const remaining = order.max_downloads - order.download_count

  // Generate signed URLs for each file
  const filesWithUrls = await Promise.all(
    files.map(async (file: any) => {
      const { data } = await supabase.storage
        .from('product-files')
        .createSignedUrl(file.file_path, 3600)
      return { ...file, signedUrl: data?.signedUrl }
    })
  )

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-6 py-32">
        <div className="max-w-md w-full space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">{product?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {remaining > 0
                ? `${remaining} download${remaining !== 1 ? 's' : ''} remaining`
                : 'Download limit reached'
              }
            </p>
          </div>

          {/* Thank you message */}
          {product?.thank_you_message && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 text-sm text-foreground">
              {product.thank_you_message}
            </div>
          )}

          {/* Files */}
          {remaining > 0 ? (
            <div className="space-y-3">
              {filesWithUrls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No files available</div>
              ) : (
                filesWithUrls.map((file: any) => (
                  <a
                    key={file.id}
                    href={`/api/download/${params.token}`}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      {file.file_size && (
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                  </a>
                ))
              )}

              <Button size="lg" variant="gradient" className="w-full" asChild>
                <a href={`/api/download/${params.token}`}>
                  <Download className="w-4 h-4" />
                  Download {files.length === 1 ? 'file' : `all ${files.length} files`}
                </a>
              </Button>
            </div>
          ) : (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 text-center">
              <p className="text-sm text-destructive font-medium">Download limit reached</p>
              <p className="text-xs text-muted-foreground mt-1">
                You&apos;ve used all {order.max_downloads} download attempts. Please contact the seller if you need access again.
              </p>
            </div>
          )}

          <div className="text-center">
            <Link href="/store" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse more products →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
