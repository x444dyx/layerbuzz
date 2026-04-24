import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { generateLicenceKey } from '@/lib/licence'
import { sendEmail, buildLicenceEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { orderId, productId, buyerEmail, buyerName } = await request.json()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    // Fetch product with seller info
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, seller:profiles(id, username, display_name, avatar_url)')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.product_type !== 'licence') {
      return NextResponse.json({ error: 'Product is not a licence type' }, { status: 400 })
    }

    const seller = product.seller as any

    // Generate unique key
    let key: string
    let attempts = 0
    do {
      key = generateLicenceKey(product.title, product.licence_prefix)
      const { data: existing } = await supabase
        .from('licence_keys')
        .select('id')
        .eq('key', key)
        .single()
      if (!existing) break
      attempts++
    } while (attempts < 10)

    // Insert licence key
    const { data: licence, error: licenceError } = await supabase
      .from('licence_keys')
      .insert({
        product_id: productId,
        order_id: orderId || null,
        seller_id: product.seller_id,
        buyer_email: buyerEmail,
        buyer_name: buyerName || null,
        key,
        status: 'active',
        max_activations: product.licence_max_activations || 1,
        activation_count: 0,
      })
      .select()
      .single()

    if (licenceError) {
      return NextResponse.json({ error: licenceError.message }, { status: 500 })
    }

    // Send licence email
    const emailTemplate = product.licence_email_body ||
      `Hi {{buyer_name}},\n\nThank you for purchasing {{product_title}}!\n\nYour licence key is:\n\n{{licence_key}}\n\nThis licence allows up to {{max_activations}} activation(s).\n\nIf you have any issues please reply to this email.\n\nThanks,\n{{seller_name}}`

    const emailSubject = product.licence_email_subject ||
      `Your ${product.title} licence key`

    const html = buildLicenceEmail({
      template: emailTemplate,
      buyerName: buyerName || 'there',
      buyerEmail,
      licenceKey: key,
      maxActivations: product.licence_max_activations || 1,
      sellerName: seller?.display_name || seller?.username || 'the seller',
      productTitle: product.title,
    })

    await sendEmail({
      to: buyerEmail,
      subject: emailSubject,
      html,
    })

    return NextResponse.json({ success: true, key, licenceId: licence.id })
  } catch (err: any) {
    console.error('Issue licence error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
