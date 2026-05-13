import type { ReactNode } from 'react'

export function KpiCard({
  detail,
  icon,
  label,
  tone = 'neutral',
  value,
}: {
  detail: string
  icon?: ReactNode
  label: string
  tone?: 'good' | 'neutral' | 'risk'
  value: string
}) {
  const toneClass = {
    good: 'border-[#009b77]/25 bg-[#e7f7f0]',
    neutral: 'border-[#13201b]/10 bg-white',
    risk: 'border-[#e85d3f]/25 bg-[#fff0eb]',
  }[tone]

  return (
    <div className={`control-surface rounded-md p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]">{label}</p>
        {icon ? <span className="text-[#405449]">{icon}</span> : null}
      </div>
      <strong className="mt-3 block text-2xl font-semibold text-[#13201b]">{value}</strong>
      <span className="mt-1 block text-sm text-[#5d6b63]">{detail}</span>
    </div>
  )
}
