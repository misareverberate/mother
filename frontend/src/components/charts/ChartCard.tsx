import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  padded = true,
}: {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <Card className={cn(className)} padded={padded}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold tracking-tight text-ink-900">
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}
