import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  // Use service role to bypass RLS for order lookup
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, product:products(id, title, files:product_files(*))')
    .eq('download_token', token)
    .eq('status', 'completed')
    .single()

  if (error || !order) {
    return new NextResponse('Download link not found or has expired.', { status: 404 })
  }

  if (order.download_count >= order.max_downloads) {
    return new NextResponse('Download limit reached. Please contact the seller.', { status: 403 })
  }

  const product = order.product as any
  const files = product?.files as any[]

  if (!files || files.length === 0) {
    return new NextResponse('No files available for this product.', { status: 404 })
  }

  // Update download count
  await supabase
    .from('orders')
    .update({ download_count: order.download_count + 1 })
    .eq('id', order.id)

  // Track download event
  await supabase.from('analytics_events').insert({
    product_id: product.id,
    seller_id: order.seller_id,
    event_type: 'download',
  })

  // If single file, download directly via service role
  if (files.length === 1) {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('product-files')
      .download(files[0].file_path)

    if (downloadError || !fileData) {
      console.error('Storage download error:', downloadError)
      return new NextResponse('Failed to retrieve file.', { status: 500 })
    }

    const filename = files[0].name || files[0].file_path.split('/').pop() || 'download'

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': fileData.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileData.size.toString(),
      },
    })
  }

  // Multiple files — generate signed URLs for download page
  const signedUrls = await Promise.all(
    files.map(async (file) => {
      const { data: fileData } = await supabase.storage
        .from('product-files')
        .download(file.file_path)
      // For multi-file, still use signed URLs but with longer expiry
      const { data } = await supabase.storage
        .from('product-files')
        .createSignedUrl(file.file_path, 3600)
      return { name: file.name, url: data?.signedUrl || '' }
    })
  )

  // Return a simple HTML download page for multiple files
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download — ${product.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f9f9f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: white; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    p { color: #666; font-size: 14px; margin-bottom: 24px; }
    .file { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #eee; border-radius: 12px; margin-bottom: 8px; text-decoration: none; color: inherit; transition: background 0.15s; }
    .file:hover { background: #f5f3ff; border-color: #7c3aed; }
    .icon { width: 36px; height: 36px; background: #f5f3ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .name { font-size: 14px; font-weight: 500; flex: 1; }
    .dl { font-size: 12px; color: #7c3aed; font-weight: 500; }
    .footer { margin-top: 24px; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Your download is ready</h1>
    <p>Thank you for your purchase of <strong>${product.title}</strong>. Click each file below to download.</p>
    ${signedUrls.map(f => `
      <a href="${f.url}" class="file" download>
        <div class="icon">📄</div>
        <span class="name">${f.name}</span>
        <span class="dl">Download</span>
      </a>
    `).join('')}
    <div class="footer">Powered by LayerBuzz • Links expire in 5 minutes</div>
  </div>
</body>
</html>
`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
