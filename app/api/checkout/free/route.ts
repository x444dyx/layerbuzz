import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { productId, email, name } = await request.json()

    if (!productId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Server-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Use service role to bypass RLS for order lookups
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_published', true)
      .eq('is_deleted', false)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.is_free && product.price > 0) {
      return NextResponse.json({ error: 'Product is not free' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Check if this email already has an order for this product — reuse token
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('product_id', productId)
      .eq('buyer_email', email.toLowerCase())
      .eq('status', 'completed')
      .single()

    if (existingOrder) {
      if (product.product_type === 'licence') {
        return NextResponse.json({ type: 'licence', message: 'Licence key already sent to your email' })
      }
      return NextResponse.json({ downloadUrl: `${appUrl}/download/${existingOrder.download_token}` })
    }

    const downloadToken = uuidv4()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id: productId,
        seller_id: product.seller_id,
        buyer_email: email.toLowerCase(),
        buyer_name: name || null,
        amount: 0,
        platform_fee: 0,
        seller_amount: 0,
        status: 'completed',
        download_token: downloadToken,
        download_count: 0,
        max_downloads: 5,
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Update product sales count
    await supabase
      .from('products')
      .update({ sales_count: (product.sales_count || 0) + 1 })
      .eq('id', productId)

    // Update seller total_sales
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('total_sales')
      .eq('id', product.seller_id)
      .single()
    await supabase
      .from('profiles')
      .update({ total_sales: (sellerProfile?.total_sales || 0) + 1 })
      .eq('id', product.seller_id)

    // Licence product — issue key via internal API
    if (product.product_type === 'licence') {
      await fetch(`${appUrl}/api/licences/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          productId,
          buyerEmail: email.toLowerCase(),
          buyerName: name || '',
        }),
      })
      return NextResponse.json({ type: 'licence', message: 'Licence key sent to your email' })
    }

    // File product — send download link email
    const downloadUrl = `${appUrl}/download/${downloadToken}`
    try {
      await sendEmail({
        to: email.toLowerCase(),
        subject: `Your download is ready — ${product.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
            <h2 style="margin:0 0 8px;">Your download is ready 🎉</h2>
            <p style="color:#64748b;margin:0 0 24px;">Hi${name ? ` ${name}` : ''}, thanks for grabbing <strong>${product.title}</strong>.</p>
            <a href="${downloadUrl}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Download now</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px;">This link allows up to 5 downloads. Keep this email safe.</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Failed to send download email:', emailErr)
    }

    return NextResponse.json({ downloadUrl })
  } catch (err: any) {
    console.error('Free checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
