import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-100 text-brand-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
}

const DOTS: Record<Tone, string> = {
  neutral: 'bg-ink-400',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
}

export function Badge({
  tone = 'neutral',
  dot = false,
  pulse = false,
  className,
  children,
}: {
  tone?: Tone
  dot?: boolean
  pulse?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('size-1.5 rounded-full', DOTS[tone], pulse && 'animate-pulse-dot')}
        />
      )}
      {children}
    </span>
  )
}
