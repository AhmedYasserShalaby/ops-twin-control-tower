import type { ReactNode } from 'react'
import { AnimatedNumber } from './AnimatedNumber'
import { Sparkline } from './Sparkline'
import { Tooltip } from './Tooltip'

export function KpiCard({
  detail,
  icon,
  label,
  tone = 'neutral',
  value,
  numericValue,
  format,
  sparkData,
  tooltip,
}: {
  detail: string
  icon?: ReactNode
  label: string
  tone?: 'good' | 'neutral' | 'risk'
  value: string
  numericValue?: number
  format?: (n: number) => string
  sparkData?: number[]
  tooltip?: string
}) {
  const glowClass = {
    good: 'glow-good',
    neutral: '',
    risk: 'glow-risk',
  }[tone]

  const accentColor = {
    good: '#00e5a0',
    neutral: '#64748b',
    risk: '#ff5a5a',
  }[tone]

  return (
    <div className={`control-surface interactive-card rounded-xl p-5 ${glowClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {tooltip ? (
            <Tooltip content={tooltip}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] cursor-help">
                {label}
              </p>
            </Tooltip>
          ) : (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
          )}
        </div>
        {icon ? <span className="text-[var(--text-muted)]">{icon}</span> : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          {numericValue !== undefined && format ? (
            <AnimatedNumber
              value={numericValue}
              format={format}
              className="block text-2xl font-bold text-[var(--text-primary)]"
            />
          ) : (
            <strong className="block text-2xl font-bold text-[var(--text-primary)]">{value}</strong>
          )}
          <span className="mt-1 block text-sm text-[var(--text-muted)]">{detail}</span>
        </div>
        {sparkData && sparkData.length > 1 ? (
          <div className="shrink-0 opacity-80">
            <Sparkline data={sparkData} color={accentColor} width={80} height={28} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
