import { useMemo } from 'react'

import { MousePointerClick, Send, TrendingUp } from 'lucide-react'

import { formatBRL, formatDay, formatNumber } from '@/lib/format'
import {
  categoryRevenue,
  platformStats,
  postsTrend,
  revenueTrend,
  topProducts,
} from '@/data'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { CHART_COLORS, Donut, TrendArea } from '@/components/charts/Charts'
import { Badge } from '@/components/ui/Badge'

export function AnalyticsPage() {
  const totals = useMemo(() => {
    const posts = platformStats.reduce((sum, p) => sum + p.posts, 0)
    const impressions = platformStats.reduce((sum, p) => sum + p.impressions, 0)
    const clicks = platformStats.reduce((sum, p) => sum + p.clicks, 0)
    const conversions = platformStats.reduce((sum, p) => sum + p.conversions, 0)
    const revenue = platformStats.reduce((sum, p) => sum + p.revenue, 0)
    return { posts, impressions, clicks, conversions, revenue }
  }, [])

  const revenueChartData = useMemo(
    () =>
      revenueTrend.map((p) => ({
        label: formatDay(p.day),
        actual: p.actual,
        estimated: p.estimated,
      })),
    [],
  )

  const platformChartData = useMemo(
    () =>
      platformStats.map((p) => ({
        label: p.platform,
        Impressions: p.impressions,
        Clicks: p.clicks,
      })),
    [],
  )

  const top = topProducts(6)

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Analytics</h2>
        <p className="mt-1 text-[15px] text-ink-500">
          Performance of your content operation.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Posts generated"
          value={formatNumber(totals.posts)}
          icon={<Send className="size-5" />}
        />
        <StatCard
          label="Total impressions"
          value={formatNumber(totals.impressions)}
          icon={<TrendingUp className="size-5" />}
        />
        <StatCard
          label="Total clicks"
          value={formatNumber(totals.clicks)}
          icon={<MousePointerClick className="size-5" />}
        />
        <StatCard
          label="Estimated revenue"
          value={formatBRL(totals.revenue)}
          delta="+18.4%"
          icon={<TrendingUp className="size-5" />}
          hint="vs last month"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Content generation"
          subtitle="Posts generated vs published · last 14 days"
        >
          <TrendArea
            data={postsTrend}
            series={[
              { key: 'generated', name: 'Generated', color: CHART_COLORS[0] },
              { key: 'published', name: 'Published', color: CHART_COLORS[1] },
            ]}
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Category distribution"
          subtitle="Share of estimated revenue"
        >
          <Donut
            data={categoryRevenue.map((c) => ({ name: c.category, value: c.revenue }))}
            height={210}
            formatter={(v) => formatBRL(v)}
          />
          <ul className="mt-4 space-y-2">
            {categoryRevenue
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 4)
              .map((c, i) => (
                <li key={c.category} className="flex items-center gap-2 text-[13px]">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="flex-1 text-ink-600">{c.category}</span>
                  <span className="font-semibold tabular-nums text-ink-900">
                    {formatBRL(c.revenue)}
                  </span>
                </li>
              ))}
          </ul>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Revenue over time"
          subtitle="Actual vs estimated · last 30 days · mock projection"
        >
          <TrendArea
            data={revenueChartData}
            series={[
              { key: 'estimated', name: 'Estimated', color: CHART_COLORS[0] },
              { key: 'actual', name: 'Actual', color: CHART_COLORS[1] },
            ]}
            height={280}
          />
        </ChartCard>

        <ChartCard title="Top products" subtitle="By estimated revenue">
          <ol className="space-y-4">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold tabular-nums text-ink-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[13px] font-medium text-ink-800">
                      {p.name}
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums text-ink-900">
                      {formatBRL(p.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.max(6, (p.revenue / top[0].revenue) * 100)}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </ChartCard>
      </div>

      <ChartCard
        title="Platform performance"
        subtitle="X vs Telegram · impressions and clicks"
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {platformStats.map((p) => (
            <Card key={p.platform} padded className="bg-ink-50/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink-900">{p.platform}</p>
                <Badge tone={p.platform === 'X' ? 'brand' : 'info'}>{p.posts} posts</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Impressions', value: formatNumber(p.impressions) },
                  { label: 'Clicks', value: formatNumber(p.clicks) },
                  { label: 'Revenue', value: formatBRL(p.revenue) },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-sm font-bold tabular-nums text-ink-900">{m.value}</p>
                    <p className="text-[11px] text-ink-500">{m.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-500">
                CTR <span className="font-semibold text-ink-800">{p.ctr}%</span> ·{' '}
                <span className="font-semibold text-ink-800">{p.conversions}</span> conversions
              </p>
            </Card>
          ))}
        </div>
        <TrendArea
          data={platformChartData}
          series={[
            { key: 'Impressions', name: 'Impressions', color: CHART_COLORS[0] },
            { key: 'Clicks', name: 'Clicks', color: CHART_COLORS[1] },
          ]}
          type="bar"
          height={260}
        />
      </ChartCard>
    </div>
  )
}
