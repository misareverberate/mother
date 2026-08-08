const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const BRL_0 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const DAY = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' })
const DATETIME = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatBRL(value: number): string {
  return BRL.format(value)
}

export function formatBRL0(value: number): string {
  return BRL_0.format(value)
}

export function formatNumber(value: number): string {
  return NUM.format(value)
}

export function formatCompact(value: number): string {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(value)
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : ''
  const fixed = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
  return `${sign}${fixed}%`
}

export function formatDay(iso: string): string {
  return DAY.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return DATETIME.format(new Date(iso))
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(diff / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDateShort(iso)
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
