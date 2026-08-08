import type { RevenuePoint } from '@/types'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const revenueMonth = {
  estimated: 3842.4,
  actual: 1520.8,
  projected: 5240.0,
  deltaPct: 18.4,
  daysLeft: 14,
  avgDaily: 164.2,
}

export const revenueByPlatform = [
  { platform: 'X' as const, value: 2240.6, pct: 58 },
  { platform: 'Telegram' as const, value: 1601.8, pct: 42 },
]

export const revenueTrend: RevenuePoint[] = Array.from({ length: 30 }, (_, i) => {
  const rnd = mulberry32(i * 11 + 5)
  const day = new Date()
  day.setDate(day.getDate() - (29 - i))
  day.setHours(0, 0, 0, 0)
  const trend = (i / 29) * 62
  const season = i % 7 === 0 ? -9 : i % 7 === 5 ? 14 : 0
  const estimated = Math.max(18, Math.round(58 + trend + season + rnd() * 46))
  const actual = Math.max(6, Math.round(estimated * (0.42 + rnd() * 0.3)))
  return { day: day.toISOString(), actual, estimated }
})
