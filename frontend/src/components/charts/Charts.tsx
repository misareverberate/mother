import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatCompact } from '@/lib/format'
import { ChartTooltip } from '@/components/charts/ChartTooltip'

export const CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#0ea5e9',
  '#8b5cf6',
  '#84cc16',
  '#14b8a6',
]

const AXIS_TICK = { fontSize: 11, fill: '#6b7385' }

interface Point {
  label: string
  [key: string]: string | number
}

export function TrendArea({
  data,
  series,
  height = 260,
  stackId,
  type = 'area',
}: {
  data: Point[]
  series: { key: string; name: string; color: string }[]
  height?: number
  stackId?: string
  type?: 'area' | 'bar'
}) {
  const gradients = series.map((s) => ({ ...s, id: `grad-${s.key.replace(/\W/g, '')}` }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'area' ? (
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            {gradients.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={g.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <Tooltip
            cursor={{ stroke: '#d8dce3', strokeDasharray: '3 3' }}
            content={<ChartTooltip />}
          />
          {gradients.map((g) => (
            <Area
              key={g.key}
              type="monotone"
              dataKey={g.key}
              name={g.name}
              stackId={stackId}
              stroke={g.color}
              strokeWidth={2}
              fill={`url(#${g.id})`}
              connectNulls
            />
          ))}
        </AreaChart>
      ) : (
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <Tooltip
            cursor={{ fill: 'rgba(236, 238, 242, 0.6)' }}
            content={<ChartTooltip />}
          />
          {gradients.map((g) => (
            <Bar
              key={g.key}
              dataKey={g.key}
              name={g.name}
              stackId={stackId}
              fill={g.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

export function TrendBars({
  data,
  dataKey,
  name,
  color = '#6366f1',
  height = 220,
}: {
  data: Point[]
  dataKey: string
  name: string
  color?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={34}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(236, 238, 242, 0.6)' }}
          content={<ChartTooltip />}
        />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Donut({
  data,
  colors = CHART_COLORS,
  height = 220,
  formatter,
}: {
  data: { name: string; value: number }[]
  colors?: string[]
  height?: number
  formatter?: (value: number) => string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatter?.(v) ?? formatCompact(v)} />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="68%"
          outerRadius="92%"
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
