import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, id, data } = await req.json()

  // Verify ownership
  const { data: discount } = await supabase
    .from('discount_codes')
    .select('id, seller_id')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  if (!discount) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'toggle') {
    const { data: updated } = await supabase
      .from('discount_codes')
      .update({ is_active: data.is_active })
      .eq('id', id)
      .select()
      .single()
    return NextResponse.json({ discount: updated })
  }

  if (action === 'delete') {
    await supabase.from('discount_codes').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'edit') {
    const { data: updated } = await supabase
      .from('discount_codes')
      .update({
        code: data.code?.toUpperCase().trim(),
        discount_type: data.discount_type,
        discount_value: parseFloat(data.discount_value),
        max_uses: data.max_uses ? parseInt(data.max_uses) : null,
        expires_at: data.expires_at || null,
      })
      .eq('id', id)
      .select()
      .single()
    return NextResponse.json({ discount: updated })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
