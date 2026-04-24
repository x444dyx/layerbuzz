import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/product-form'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: product } = await supabase
    .from('products')
    .select('*, files:product_files(*)')
    .eq('id', params.id)
    .eq('seller_id', user.id)
    .single()

  if (!product) notFound()

  return <ProductForm initialData={product} productId={product.id} />
}
