import type { ReactNode } from 'react'

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string
  formatter?: (value: number) => ReactNode
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-ink-200 bg-white/95 px-3.5 py-2.5 shadow-pop backdrop-blur">
      {label && (
        <p className="mb-1.5 text-xs font-semibold text-ink-500">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-xs text-ink-500">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="text-xs font-semibold tabular-nums text-ink-900">
              {formatter ? formatter(entry.value ?? 0) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
