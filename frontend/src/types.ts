export type Category =
  | 'Electronics'
  | 'Beauty'
  | 'Home'
  | 'Fashion'
  | 'Accessories'
  | 'Gaming'
  | 'Fitness'
  | 'Gadgets'

export const CATEGORIES: Category[] = [
  'Electronics',
  'Beauty',
  'Home',
  'Fashion',
  'Accessories',
  'Gaming',
  'Fitness',
  'Gadgets',
]

export type ProductStatus = 'active' | 'paused' | 'inactive'

export interface Product {
  id: string
  name: string
  category: Category
  price: number
  originalPrice: number
  discountPct: number
  commissionPct: number
  status: ProductStatus
  affiliateUrl: string
  clicks: number
  conversions: number
  revenue: number
  rating: number
  sales: number
  createdAt: string
}

export type PostStatus = 'ready' | 'published' | 'archived'
export type Platform = 'X' | 'Telegram'

export interface PostPerformance {
  impressions: number
  clicks: number
  likes: number
}

export interface Post {
  id: string
  productId: string
  platform: Platform
  status: PostStatus
  content: string
  createdAt: string
  publishedAt: string | null
  performance: PostPerformance | null
}

export interface TrendPoint {
  label: string
  [key: string]: string | number
}

export interface RevenuePoint {
  day: string
  actual: number
  estimated: number
}

export interface PlatformStats {
  platform: Platform
  posts: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
}
