import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padded?: boolean
}

export function Card({
  hover = false,
  padded = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-200/70 bg-surface shadow-card',
        hover &&
          'transition-all duration-200 ease-snappy hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-pop',
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
