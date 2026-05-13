import { area, curveMonotoneX, line, scaleLinear } from 'd3'
import { useId, useMemo, useState } from 'react'
import type { WeeklyMetric, ScenarioEvent } from '../domain/types'
import { formatCurrency, formatNumber, formatPercent } from '../domain/format'

interface TrendChartProps {
  data: WeeklyMetric[]
  metric: keyof WeeklyMetric
  stroke?: string
  events?: ScenarioEvent[]
  height?: number
}

export function TrendChart({
  data,
  metric,
  stroke = '#00e5a0',
  events,
  height: chartHeight = 220,
}: TrendChartProps) {
  const id = useId()
  const width = 720
  const height = chartHeight
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { min, max, xScale, yScale, linePath, areaPath } = useMemo(() => {
    const vals = data.map((item) => Number(item[metric]))
    const mn = Math.min(...vals)
    const mx = Math.max(...vals)
    const pad = (mx - mn) * 0.08 || 1
    const xs = scaleLinear().domain([1, data.length]).range([40, width - 24])
    const ys = scaleLinear().domain([mn - pad, mx + pad]).range([height - 30, 20])

    const lp = line<WeeklyMetric>()
      .x((item) => xs(item.week))
      .y((item) => ys(Number(item[metric])))
      .curve(curveMonotoneX)(data)

    const ap = area<WeeklyMetric>()
      .x((item) => xs(item.week))
      .y0(height - 30)
      .y1((item) => ys(Number(item[metric])))
      .curve(curveMonotoneX)(data)

    return { min: mn, max: mx, xScale: xs, yScale: ys, linePath: lp, areaPath: ap }
  }, [data, metric, width, height])

  const formatValue = (v: number) => {
    if (metric === 'profit' || metric === 'revenue' || metric === 'cashBalance' || metric === 'grossMargin' || metric === 'holdingCost' || metric === 'expediteCost' || metric === 'operatingCost' || metric === 'inventoryValue') {
      return formatCurrency(v)
    }
    if (metric === 'serviceLevel' || metric === 'dataQualityScore') {
      return formatPercent(v)
    }
    return formatNumber(v)
  }

  const gridLines = useMemo(() => {
    const range = max - min
    const step = range / 4
    return Array.from({ length: 5 }, (_, i) => min + step * i)
  }, [min, max])

  return (
    <svg
      className="h-full min-h-52 w-full"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${String(metric)} trend chart`}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <defs>
        <linearGradient id={`trend-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={width} height={height} rx="12" fill="var(--bg-surface)" />

      {/* Grid lines */}
      {gridLines.map((v, i) => {
        const y = yScale(v)
        return (
          <g key={i}>
            <line x1="40" x2={width - 24} y1={y} y2={y} stroke="var(--border-subtle)" strokeWidth="1" />
            <text x="36" y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">
              {metric === 'profit' || metric === 'cashBalance' ? `$${(v / 1000).toFixed(0)}k` : formatNumber(v)}
            </text>
          </g>
        )
      })}

      {/* Event markers */}
      {events?.map((event) => {
        const x = xScale(event.week)
        return (
          <g key={event.id}>
            <line
              x1={x}
              x2={x}
              y1={20}
              y2={height - 30}
              stroke="var(--accent-red)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <circle cx={x} cy={16} r={4} fill="var(--accent-red)" opacity={0.7} />
            <text x={x + 6} y={16} fill="var(--accent-red)" fontSize="9" opacity={0.8}>
              {event.name.split(' ')[0]}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath ?? ''} fill={`url(#trend-grad-${id})`} className="animate-fade-in" />

      {/* Line */}
      <path
        d={linePath ?? ''}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth="2.5"
        className="animate-draw-line"
      />

      {/* Interaction overlay */}
      {data.map((item, index) => {
        const x = xScale(item.week)
        return (
          <g key={item.week}>
            <rect
              x={x - (width / data.length) / 2}
              y={0}
              width={width / data.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
            />
          </g>
        )
      })}

      {/* Hover crosshair and tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (() => {
        const item = data[hoverIndex]
        const x = xScale(item.week)
        const y = yScale(Number(item[metric]))
        const val = Number(item[metric])

        return (
          <g>
            <line x1={x} x2={x} y1={20} y2={height - 30} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
            <circle cx={x} cy={y} r={5} fill={stroke} stroke="var(--bg-surface)" strokeWidth="2" />

            {/* Tooltip box */}
            <g transform={`translate(${x < width / 2 ? x + 10 : x - 130}, ${Math.max(y - 40, 10)})`}>
              <rect width="120" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1" />
              <text x="10" y="18" fill="var(--text-muted)" fontSize="10" fontWeight="600">Week {item.week}</text>
              <text x="10" y="34" fill="var(--text-primary)" fontSize="13" fontWeight="700">{formatValue(val)}</text>
            </g>
          </g>
        )
      })()}

      {/* X-axis labels */}
      {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((item) => (
        <text
          key={`label-${item.week}`}
          x={xScale(item.week)}
          y={height - 8}
          fill="var(--text-muted)"
          fontSize="10"
          textAnchor="middle"
        >
          W{item.week}
        </text>
      ))}
    </svg>
  )
}
