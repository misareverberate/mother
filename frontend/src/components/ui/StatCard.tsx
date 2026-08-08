import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'

export function StatCard({
  label,
  value,
  delta,
  deltaTone = 'success',
  icon,
  hint,
}: {
  label: string
  value: ReactNode
  delta?: ReactNode
  deltaTone?: 'success' | 'danger' | 'warning' | 'neutral'
  icon: ReactNode
  hint?: string
}) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink-500">{label}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-ink-900 tabular-nums">
            {value}
          </p>
          {delta && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                  deltaTone === 'success' && 'bg-emerald-100 text-emerald-700',
                  deltaTone === 'danger' && 'bg-rose-100 text-rose-700',
                  deltaTone === 'warning' && 'bg-amber-100 text-amber-700',
                  deltaTone === 'neutral' && 'bg-ink-100 text-ink-600',
                )}
              >
                {delta}
              </span>
              {hint && <span className="text-xs text-ink-500">{hint}</span>}
            </div>
          )}
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
          {icon}
        </div>
      </div>
    </Card>
  )
}
