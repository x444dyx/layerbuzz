export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  website: string | null
  twitter: string | null
  stripe_account_id: string | null
  stripe_onboarded: boolean
  total_sales: number
  total_revenue: number
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  seller_id: string
  title: string
  slug: string
  description: string | null
  price: number
  currency: string
  cover_image_url: string | null
  thumbnail_url: string | null
  category: string
  tags: string[]
  is_free: boolean
  is_published: boolean
  is_deleted: boolean
  sales_count: number
  view_count: number
  rating_avg: number
  rating_count: number
  custom_cta: string | null
  thank_you_message: string | null
  created_at: string
  updated_at: string
  // Joined
  seller?: Profile
  files?: ProductFile[]
  reviews?: Review[]
}

export type ProductFile = {
  id: string
  product_id: string
  name: string
  file_path: string
  file_size: number | null
  file_type: string | null
  sort_order: number
  created_at: string
}

export type Order = {
  id: string
  product_id: string | null
  seller_id: string | null
  buyer_email: string
  buyer_name: string | null
  amount: number
  currency: string
  platform_fee: number
  seller_amount: number
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  status: 'pending' | 'completed' | 'refunded' | 'disputed'
  download_token: string
  download_count: number
  max_downloads: number
  created_at: string
  updated_at: string
  // Joined
  product?: Product
}

export type Review = {
  id: string
  product_id: string
  order_id: string
  buyer_email: string
  buyer_name: string | null
  rating: number
  comment: string | null
  is_verified: boolean
  created_at: string
}

export type DiscountCode = {
  id: string
  seller_id: string
  product_id: string | null
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export type AnalyticsEvent = {
  id: string
  product_id: string | null
  seller_id: string | null
  event_type: 'view' | 'click' | 'purchase' | 'download'
  referrer: string | null
  country: string | null
  created_at: string
}

export type ProductCategory =
  | 'digital-art'
  | 'ebooks'
  | 'software'
  | 'templates'
  | 'music'
  | 'videos'
  | 'courses'
  | 'photography'
  | 'fonts'
  | 'plugins'
  | 'other'

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string; emoji: string }[] = [
  { value: 'digital-art', label: 'Digital Art', emoji: '🎨' },
  { value: 'ebooks', label: 'eBooks', emoji: '📚' },
  { value: 'software', label: 'Software & Apps', emoji: '💻' },
  { value: 'templates', label: 'Templates', emoji: '📋' },
  { value: 'music', label: 'Music & Audio', emoji: '🎵' },
  { value: 'videos', label: 'Videos', emoji: '🎬' },
  { value: 'courses', label: 'Courses', emoji: '🎓' },
  { value: 'photography', label: 'Photography', emoji: '📷' },
  { value: 'fonts', label: 'Fonts', emoji: '🔤' },
  { value: 'plugins', label: 'Plugins & Extensions', emoji: '🔌' },
  { value: 'other', label: 'Other', emoji: '✨' },
]
