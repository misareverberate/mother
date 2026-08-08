import { cn } from '@/lib/cn'

export interface TabOption<T extends string> {
  value: T
  label: string
  count?: number
}

export function TabBar<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: TabOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 shadow-sm',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium transition-all duration-150',
              active
                ? 'bg-ink-900 text-white shadow-sm'
                : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums',
                  active ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-500',
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
