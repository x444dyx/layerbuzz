import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, revoke } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  // Verify the order belongs to this seller
  const { data: order } = await supabase
    .from('orders')
    .select('id, seller_id')
    .eq('id', orderId)
    .eq('seller_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Revoke = set max_downloads to 0, restore = set back to 5
  const { error } = await supabase
    .from('orders')
    .update({ max_downloads: revoke ? 0 : 5 })
    .eq('id', orderId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
