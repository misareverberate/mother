import type { Platform, Post, PostPerformance, Product } from '@/types'
import { formatBRL } from '@/lib/format'
import { mockProducts } from '@/data/products'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function isoFromNow(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3_600_000)
  return d.toISOString()
}

function performanceFor(rnd: () => number): PostPerformance {
  const impressions = Math.round(1800 + rnd() * 32000)
  const clicks = Math.round(40 + rnd() * 700)
  const likes = Math.round(clicks * (0.08 + rnd() * 0.4))
  return { impressions, clicks, likes }
}

const TEMPLATES = [
  (p: Product, price: string, original: string) =>
    `🔥 Oferta encontrada!\n\n${p.name}\nde ${original} por ${price}.\n\n⚡ ${p.discountPct}% OFF por tempo limitado!\n\n🛒 Confira aqui:\n${p.affiliateUrl}\n\n#promo #ofertas #tiktokshop`,
  (p: Product, price: string, original: string) =>
    `🚨 Achei um achado!\n\n${p.name} está com ${p.discountPct}% de desconto.\n\nDe ${original} por apenas ${price}. 🥵\n\n🛒 Link na bio:\n${p.affiliateUrl}\n\n#achados #tiktokshop #promoção`,
  (p: Product, price: string, original: string) =>
    `💥 Vale muito a pena!\n\n${p.name}\nde ${original} por ${price}.\n\nCorre, que é por tempo limitado!\n\n🛒 Garanta o seu:\n${p.affiliateUrl}\n\n#ofertas #tiktokshop #compras`,
  (p: Product, price: string, original: string) =>
    `🤯 ${p.discountPct}% OFF agora!\n\n${p.name}\n\nDe ${original} por ${price} no TikTok Shop.\n\n🛒 Confira:\n${p.affiliateUrl}\n\n#promoção #tiktokshop #valeapena`,
]

function buildContent(product: Product, seed: number): string {
  const template = TEMPLATES[seed % TEMPLATES.length]
  return template(product, formatBRL(product.price), formatBRL(product.originalPrice))
}

const TOTAL = 64
const READY_COUNT = 17
const ARCHIVED_COUNT = 7

export const mockPosts: Post[] = Array.from({ length: TOTAL }, (_, i) => {
  const rnd = mulberry32(i * 31 + 7)
  const isReady = i < READY_COUNT
  const isArchived = i >= TOTAL - ARCHIVED_COUNT
  const product = mockProducts[(i * 7 + 3) % mockProducts.length]
  const platform: Platform = isReady ? 'X' : rnd() < 0.32 ? 'Telegram' : 'X'

  const createdAt = isReady
    ? isoFromNow(0.4 + rnd() * 70)
    : isArchived
      ? isoFromNow(240 + rnd() * 160)
      : isoFromNow(80 + rnd() * 260)

  const publishedAt = isReady
    ? null
    : isoFromNow(
        (Date.now() - new Date(createdAt).getTime()) / 3_600_000 -
          (0.5 + rnd() * 12),
      )

  return {
    id: `P-${1001 + i}`,
    productId: product.id,
    platform,
    status: isReady ? 'ready' : isArchived ? 'archived' : 'published',
    content: buildContent(product, i),
    createdAt,
    publishedAt,
    performance: isReady ? null : performanceFor(rnd),
  }
})
