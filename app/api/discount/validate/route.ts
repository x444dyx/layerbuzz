import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { code, productId } = await request.json()

    if (!code) {
      return NextResponse.json({ valid: false, error: 'No code provided' })
    }

    const supabase = createClient()

    // Get product to find seller
    const { data: product } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', productId)
      .single()

    if (!product) {
      return NextResponse.json({ valid: false, error: 'Product not found' })
    }

    const { data: discount } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('seller_id', product.seller_id)
      .eq('is_active', true)
      .single()

    if (!discount) {
      return NextResponse.json({ valid: false, error: 'Code not found' })
    }

    const now = new Date()
    if (discount.expires_at && new Date(discount.expires_at) < now) {
      return NextResponse.json({ valid: false, error: 'Code has expired' })
    }

    if (discount.max_uses && discount.uses_count >= discount.max_uses) {
      return NextResponse.json({ valid: false, error: 'Code has reached its usage limit' })
    }

    if (discount.product_id && discount.product_id !== productId) {
      return NextResponse.json({ valid: false, error: 'Code is not valid for this product' })
    }

    return NextResponse.json({ valid: true, discount })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 })
  }
}
