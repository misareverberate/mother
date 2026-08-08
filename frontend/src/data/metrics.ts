import type { PlatformStats, Product, TrendPoint } from '@/types'
import { mockProducts } from '@/data/products'
import { mockPosts } from '@/data/posts'
import { revenueMonth } from '@/data/revenue'
import { formatDay } from '@/lib/format'

const DAY_MS = 86_400_000

export function kpis() {
  const products = mockProducts.length
  const posts = mockPosts.length
  const ready = mockPosts.filter((p) => p.status === 'ready' && p.platform === 'X')
  const now = Date.now()
  const todayPosts = mockPosts.filter(
    (p) => now - new Date(p.createdAt).getTime() < DAY_MS,
  ).length
  const todayProducts = mockProducts.filter(
    (p) => now - new Date(p.createdAt).getTime() < 7 * DAY_MS,
  ).length

  return {
    products,
    productsDelta: todayProducts,
    posts,
    postsDelta: todayPosts,
    ready,
    readyCount: ready.length,
    revenue: revenueMonth.estimated,
    revenueDelta: revenueMonth.deltaPct,
  }
}

export const postsTrend: TrendPoint[] = Array.from({ length: 14 }, (_, i) => {
  const day = new Date()
  day.setDate(day.getDate() - (13 - i))
  day.setHours(0, 0, 0, 0)
  const end = day.getTime() + DAY_MS
  const generated = mockPosts.filter((p) => {
    const t = new Date(p.createdAt).getTime()
    return t >= day.getTime() && t < end
  }).length
  const published = mockPosts.filter((p) => {
    if (!p.publishedAt) return false
    const t = new Date(p.publishedAt).getTime()
    return t >= day.getTime() && t < end
  }).length
  return {
    label: formatDay(day.toISOString()),
    generated,
    published,
  }
})

export const platformStats: PlatformStats[] = [
  {
    platform: 'X',
    posts: mockPosts.filter((p) => p.platform === 'X').length,
    impressions: 84250,
    clicks: 4120,
    conversions: 187,
    revenue: 2240.6,
    ctr: 4.9,
  },
  {
    platform: 'Telegram',
    posts: mockPosts.filter((p) => p.platform === 'Telegram').length,
    impressions: 51230,
    clicks: 2890,
    conversions: 143,
    revenue: 1601.8,
    ctr: 5.6,
  },
]

export function topProducts(limit = 6): Product[] {
  return [...mockProducts].sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

export const categoryRevenue: { category: string; revenue: number }[] = (
  ['Electronics', 'Beauty', 'Home', 'Fashion', 'Accessories', 'Gaming', 'Fitness', 'Gadgets'] as const
).map((category) => ({
  category,
  revenue: mockProducts
    .filter((p) => p.category === category)
    .reduce((sum, p) => sum + p.revenue, 0),
}))

export const totalRevenue = mockProducts.reduce((sum, p) => sum + p.revenue, 0)
