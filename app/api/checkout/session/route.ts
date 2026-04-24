import { NextResponse } from 'next/server'
import { stripe, calculateFees } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { productId, email, name, discountCode } = await request.json()

    if (!productId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    // Fetch product with seller
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, seller:profiles(*)')
      .eq('id', productId)
      .eq('is_published', true)
      .eq('is_deleted', false)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const seller = product.seller as any

    if (!seller?.stripe_onboarded || !seller?.stripe_account_id) {
      return NextResponse.json({ error: 'Seller has not set up payments yet' }, { status: 400 })
    }

    let finalPrice = product.price
    let discountData = null

    // Validate discount code
    if (discountCode) {
      const { data: discount } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('seller_id', product.seller_id)
        .eq('is_active', true)
        .single()

      if (discount) {
        const now = new Date()
        const isExpired = discount.expires_at && new Date(discount.expires_at) < now
        const isMaxed = discount.max_uses && discount.uses_count >= discount.max_uses
        const isApplicable = !discount.product_id || discount.product_id === productId

        if (!isExpired && !isMaxed && isApplicable) {
          if (discount.discount_type === 'percent') {
            finalPrice = finalPrice * (1 - discount.discount_value / 100)
          } else {
            finalPrice = Math.max(0, finalPrice - discount.discount_value)
          }
          discountData = discount
        }
      }
    }

    const amountInPence = Math.round(finalPrice * 100)

    if (amountInPence < 50) {
      return NextResponse.json({ error: 'Amount too low for paid checkout' }, { status: 400 })
    }

    const { platformFee } = calculateFees(amountInPence)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: product.currency || 'gbp',
            product_data: {
              name: product.title,
              description: product.description?.slice(0, 500) || undefined,
              images: product.cover_image_url ? [product.cover_image_url] : [],
            },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: seller.stripe_account_id,
        },
        metadata: {
          product_id: product.id,
          seller_id: product.seller_id,
          buyer_email: email,
          buyer_name: name || '',
          discount_code: discountCode || '',
          original_price: product.price.toString(),
          final_price: finalPrice.toString(),
        },
      },
      metadata: {
        product_id: product.id,
        seller_id: product.seller_id,
        buyer_email: email,
        buyer_name: name || '',
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/p/${seller.username}/${product.slug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
