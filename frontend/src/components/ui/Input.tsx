import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 shadow-sm transition-colors',
        'placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}
