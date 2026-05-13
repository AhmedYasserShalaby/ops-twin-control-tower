import { line, scaleLinear } from 'd3'
import type { WeeklyMetric } from '../domain/types'

export function TrendChart({
  data,
  metric,
  stroke = '#009b77',
}: {
  data: WeeklyMetric[]
  metric: keyof WeeklyMetric
  stroke?: string
}) {
  const width = 720
  const height = 220
  const values = data.map((item) => Number(item[metric]))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const xScale = scaleLinear().domain([1, data.length]).range([34, width - 22])
  const yScale = scaleLinear().domain([min * 0.96, max * 1.04]).range([height - 26, 18])
  const path = line<WeeklyMetric>()
    .x((item) => xScale(item.week))
    .y((item) => yScale(Number(item[metric])))(data)

  return (
    <svg className="h-full min-h-52 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${String(metric)} trend`}>
      <rect width={width} height={height} rx="8" fill="#ffffff" />
      {[0, 1, 2, 3].map((tick) => {
        const y = 20 + tick * 52
        return <line key={tick} x1="34" x2={width - 22} y1={y} y2={y} stroke="#dce4dd" strokeDasharray="4 8" />
      })}
      <path d={path ?? ''} fill="none" stroke={stroke} strokeLinecap="round" strokeWidth="4" />
      {data.map((item, index) => (
        index % 5 === 0 ? (
          <circle key={item.week} cx={xScale(item.week)} cy={yScale(Number(item[metric]))} fill={stroke} r="4" />
        ) : null
      ))}
      <text x="34" y="206" fill="#66756b" fontSize="12">W1</text>
      <text x={width - 48} y="206" fill="#66756b" fontSize="12">W{data.length}</text>
    </svg>
  )
}
