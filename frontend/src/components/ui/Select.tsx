import type { SelectHTMLAttributes } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-xl border border-ink-200 bg-white pl-3.5 pr-9 text-sm font-medium text-ink-800 shadow-sm transition-colors',
          'hover:border-ink-300 focus:border-brand-500 focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  )
}
