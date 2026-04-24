import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { key, increment_activation } = await request.json()

    if (!key) {
      return NextResponse.json({ valid: false, error: 'No key provided' }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: licence, error } = await supabase
      .from('licence_keys')
      .select('*, product:products(title, slug), seller:profiles(username, display_name)')
      .eq('key', key.toUpperCase().trim())
      .single()

    if (error || !licence) {
      return NextResponse.json({ valid: false, error: 'Licence key not found' }, { status: 404 })
    }

    // Check status
    if (licence.status === 'revoked') {
      return NextResponse.json({ valid: false, error: 'This licence has been revoked' }, { status: 403 })
    }

    if (licence.status === 'expired') {
      return NextResponse.json({ valid: false, error: 'This licence has expired' }, { status: 403 })
    }

    // Check expiry date
    if (licence.expires_at && new Date(licence.expires_at) < new Date()) {
      await supabase.from('licence_keys').update({ status: 'expired' }).eq('id', licence.id)
      return NextResponse.json({ valid: false, error: 'This licence has expired' }, { status: 403 })
    }

    // Check activation limit
    if (licence.activation_count >= licence.max_activations) {
      return NextResponse.json({
        valid: false,
        error: `Activation limit reached (${licence.max_activations}/${licence.max_activations})`,
      }, { status: 403 })
    }

    // Increment activation count if requested (e.g. first time activation)
    if (increment_activation) {
      const now = new Date().toISOString()
      await supabase
        .from('licence_keys')
        .update({
          activation_count: licence.activation_count + 1,
          activated_at: licence.activated_at || now,
        })
        .eq('id', licence.id)
    }

    return NextResponse.json({
      valid: true,
      licence: {
        key: licence.key,
        product: (licence.product as any)?.title,
        buyer_email: licence.buyer_email,
        buyer_name: licence.buyer_name,
        status: licence.status,
        activations_used: increment_activation
          ? licence.activation_count + 1
          : licence.activation_count,
        max_activations: licence.max_activations,
        activated_at: licence.activated_at,
        expires_at: licence.expires_at,
      },
    })
  } catch (err: any) {
    console.error('Licence validate error:', err)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}

// Also support GET for simple checks
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ valid: false, error: 'No key provided' }, { status: 400 })
  }

  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  }))
}
