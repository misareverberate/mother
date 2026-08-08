import { useMemo } from 'react'

import { CalendarClock, Info, TrendingUp } from 'lucide-react'

import { formatBRL, formatDay } from '@/lib/format'
import { revenueByPlatform, revenueMonth, revenueTrend } from '@/data'
import { Card } from '@/components/ui/Card'
import { ChartCard } from '@/components/charts/ChartCard'
import { CHART_COLORS, Donut, TrendArea } from '@/components/charts/Charts'
import { MockDataChip } from '@/components/ui/MockDataChip'

export function RevenuePage() {
  const chartData = useMemo(
    () =>
      revenueTrend.map((p) => ({
        label: formatDay(p.day),
        actual: p.actual,
        estimated: p.estimated,
      })),
    [],
  )

  const totalSplit = revenueByPlatform.reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Revenue</h2>
        <p className="mt-1 text-[15px] text-ink-500">
          Revenue projections for your affiliate operation.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="relative overflow-hidden xl:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-brand-100/60 blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-ink-500">
                  Estimated this month
                </p>
                <MockDataChip />
              </div>
              <p className="mt-2 text-[44px] font-bold leading-none tracking-tight text-ink-900 tabular-nums">
                {formatBRL(revenueMonth.estimated)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <TrendingUp className="size-3.5" />
                  +{revenueMonth.deltaPct}%
                </span>
                <span className="text-xs text-ink-500">vs last month</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-500">Average per day</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-ink-900">
                {formatBRL(revenueMonth.avgDaily)}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-ink-500">
                <CalendarClock className="size-3.5" />
                {revenueMonth.daysLeft} days left this month
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-ink-500">Actual revenue</p>
              <MockDataChip />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
              {formatBRL(revenueMonth.actual)}
            </p>
            <p className="mt-1 text-xs text-ink-500">Confirmed revenue so far</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-ink-500">Projected month</p>
              <MockDataChip />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
              {formatBRL(revenueMonth.projected)}
            </p>
            <p className="mt-1 text-xs text-ink-500">Based on current performance</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Revenue trend"
          subtitle="Actual vs estimated · last 30 days · mock projection"
        >
          <TrendArea
            data={chartData}
            series={[
              { key: 'estimated', name: 'Estimated', color: CHART_COLORS[0] },
              { key: 'actual', name: 'Actual', color: CHART_COLORS[1] },
            ]}
            height={300}
          />
        </ChartCard>

        <ChartCard title="Revenue by platform" subtitle="Estimated share">
          <Donut
            data={revenueByPlatform.map((p) => ({ name: p.platform, value: p.value }))}
            height={190}
            formatter={(v) => formatBRL(v)}
          />
          <ul className="mt-4 space-y-3">
            {revenueByPlatform.map((p, i) => (
              <li key={p.platform} className="flex items-center gap-2.5 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="flex-1 font-medium text-ink-700">{p.platform}</span>
                <span className="text-xs font-semibold text-ink-500 tabular-nums">
                  {Math.round((p.value / totalSplit) * 100)}%
                </span>
                <span className="font-semibold tabular-nums text-ink-900">
                  {formatBRL(p.value)}
                </span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 px-5 py-4">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="text-[13px] leading-relaxed text-amber-800">
          <span className="font-semibold">Prototype notice:</span> all revenue figures are
          generated mock data used to validate the interface. They do not reflect real
          earnings and will be replaced by live metrics once the API integrations are in
          place.
        </p>
      </div>
    </div>
  )
}
