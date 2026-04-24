import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail } from '@/lib/email'

// Need raw body for Stripe signature verification
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const metadata = session.payment_intent
          ? (await stripe.paymentIntents.retrieve(session.payment_intent)).metadata
          : session.metadata

        if (!metadata?.product_id) break

        const amountTotal = session.amount_total || 0
        const platformFee = Math.round(amountTotal * 0.03)
        const sellerAmount = amountTotal - platformFee
        const downloadToken = uuidv4()

        const { data: newOrder, error } = await supabase.from('orders').insert({
          product_id: metadata.product_id,
          seller_id: metadata.seller_id,
          buyer_email: metadata.buyer_email || session.customer_email,
          buyer_name: metadata.buyer_name || null,
          amount: amountTotal / 100,
          platform_fee: platformFee / 100,
          seller_amount: sellerAmount / 100,
          stripe_payment_intent_id: session.payment_intent,
          status: 'completed',
          download_token: downloadToken,
          download_count: 0,
          max_downloads: 5,
        }).select().single()

        if (error) {
          console.error('Error creating order:', error)
          break
        }

        // Get product type
        const { data: product } = await supabase
          .from('products')
          .select('product_type, sales_count')
          .eq('id', metadata.product_id)
          .single()

        // Issue licence key if licence product
        if (product?.product_type === 'licence' && newOrder) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          await fetch(`${appUrl}/api/licences/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: newOrder.id,
              productId: metadata.product_id,
              buyerEmail: metadata.buyer_email || session.customer_email,
              buyerName: metadata.buyer_name || '',
            }),
          })
        }

        // Send download link email for file products
        if (product?.product_type !== 'licence' && newOrder) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const downloadUrl = `${appUrl}/download/${downloadToken}`
          const buyerEmail = metadata.buyer_email || session.customer_email
          const buyerName = metadata.buyer_name || ''
          try {
            await sendEmail({
              to: buyerEmail,
              subject: `Your download is ready`,
              html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
                  <h2 style="margin:0 0 8px;">Your download is ready 🎉</h2>
                  <p style="color:#64748b;margin:0 0 24px;">Hi${buyerName ? ` ${buyerName}` : ''}, thanks for your purchase.</p>
                  <a href="${downloadUrl}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Download now</a>
                  <p style="color:#94a3b8;font-size:12px;margin-top:24px;">This link allows up to 5 downloads. Keep this email safe.</p>
                </div>
              `,
            })
          } catch (emailErr) {
            console.error('Failed to send download email:', emailErr)
          }
        }

        // Update product sales count
        await supabase
          .from('products')
          .update({ sales_count: (product?.sales_count || 0) + 1 })
          .eq('id', metadata.product_id)

        // Update seller total_sales
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('total_sales')
          .eq('id', metadata.seller_id)
          .single()
        await supabase
          .from('profiles')
          .update({ total_sales: (sellerProfile?.total_sales || 0) + 1 })
          .eq('id', metadata.seller_id)

        // Apply discount code usage if applicable
        if (metadata.discount_code) {
          const { data: dc } = await supabase
            .from('discount_codes')
            .select('uses_count')
            .eq('code', metadata.discount_code)
            .eq('seller_id', metadata.seller_id)
            .single()
          if (dc) {
            await supabase
              .from('discount_codes')
              .update({ uses_count: (dc.uses_count || 0) + 1 })
              .eq('code', metadata.discount_code)
              .eq('seller_id', metadata.seller_id)
          }
        }

        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as any
        if (dispute.payment_intent) {
          await supabase
            .from('orders')
            .update({ status: 'disputed' })
            .eq('stripe_payment_intent_id', dispute.payment_intent)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any
        if (charge.payment_intent) {
          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', charge.payment_intent)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
