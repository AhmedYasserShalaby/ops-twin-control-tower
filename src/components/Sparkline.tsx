import { line, area, scaleLinear, curveMonotoneX } from 'd3'
import { useId } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({ data, width = 120, height = 32, color = '#00e5a0' }: SparklineProps) {
  const id = useId()
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const pad = (max - min) * 0.1 || 1
  const xScale = scaleLinear().domain([0, data.length - 1]).range([2, width - 2])
  const yScale = scaleLinear().domain([min - pad, max + pad]).range([height - 2, 2])

  const points = data.map((v, i) => ({ x: i, y: v }))

  const linePath = line<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(curveMonotoneX)(points)

  const areaPath = area<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y0(height)
    .y1((d) => yScale(d.y))
    .curve(curveMonotoneX)(points)

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath ?? ''} fill={`url(#spark-grad-${id})`} />
      <path d={linePath ?? ''} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
