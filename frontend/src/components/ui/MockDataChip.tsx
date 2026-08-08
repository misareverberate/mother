import { Info } from 'lucide-react'

import { cn } from '@/lib/cn'

export function MockDataChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700',
        className,
      )}
    >
      <Info className="size-3" />
      Mock data
    </span>
  )
}
