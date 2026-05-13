import { PageShell } from '../app/AppShell'
import { TrendChart } from '../components/TrendChart'
import { formatCurrency, formatNumber, formatPercent } from '../domain/format'
import { useOpsTwinStore } from '../store/useOpsTwinStore'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { useState } from 'react'
import type { WeeklyMetric } from '../domain/types'
import { Play, Loader2, ArrowUpDown } from 'lucide-react'

const chartMetrics: Array<{ key: keyof WeeklyMetric; label: string; color: string }> = [
  { key: 'serviceLevel', label: 'Service Level', color: '#3b82f6' },
  { key: 'profit', label: 'Profit', color: '#00e5a0' },
  { key: 'riskScore', label: 'Risk Score', color: '#ff5a5a' },
  { key: 'cashBalance', label: 'Cash Balance', color: '#ffb547' },
  { key: 'inventoryUnits', label: 'Inventory', color: '#8b5cf6' },
]

type SortKey = 'week' | 'serviceLevel' | 'profit' | 'inventoryUnits' | 'riskScore' | 'dataQualityScore'

export function AnalyticsPage() {
  const run = useOpsTwinStore((s) => s.run)
  const events = useOpsTwinStore((s) => s.events)
  const monteCarlo = useOpsTwinStore((s) => s.monteCarlo)
  const runningMC = useOpsTwinStore((s) => s.runningMonteCarlo)
  const runMC = useOpsTwinStore((s) => s.runMonteCarlo)
  const [selected, setSelected] = useState<Array<keyof WeeklyMetric>>(['serviceLevel', 'riskScore'])
  const [sortKey, setSortKey] = useState<SortKey>('week')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = [...run.weeks].sort((a, b) => {
    const d = Number(a[sortKey]) - Number(b[sortKey])
    return sortAsc ? d : -d
  })

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  return (
    <PageShell eyebrow="Tradeoff Analysis" title="Analytics workbench">
      <section className="control-surface rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">Select metrics to chart</p>
        <div className="flex flex-wrap gap-2">
          {chartMetrics.map((m) => {
            const on = selected.includes(m.key)
            return (
              <button key={m.key} type="button"
                className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${on ? 'border-2' : 'border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)]'}`}
                style={on ? { borderColor: m.color, background: `${m.color}15`, color: m.color } : {}}
                onClick={() => setSelected(p => p.includes(m.key) ? p.filter(x => x !== m.key) : [...p, m.key])}
              >
                <span className="inline-block size-2 rounded-full mr-1.5" style={{ background: m.color }} />
                {m.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {selected.map((k) => {
          const m = chartMetrics.find(x => x.key === k)
          if (!m) return null
          return (
            <div key={k} className="control-surface rounded-xl p-5 animate-fade-in-up">
              <h2 className="text-lg font-bold mb-3"><span className="inline-block size-2.5 rounded-full mr-2" style={{ background: m.color }} />{m.label} trend</h2>
              <TrendChart data={run.weeks} metric={k} stroke={m.color} events={events} />
            </div>
          )
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="control-surface rounded-xl p-5">
          <h2 className="text-lg font-bold">Monte Carlo analysis</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Runs 24 seeded variants to estimate risk range.</p>
          <button type="button" className="btn-primary mt-4" disabled={runningMC} onClick={() => void runMC()}>
            {runningMC ? <><Loader2 size={16} className="animate-spin" />Running...</> : <><Play size={16} />Run Monte Carlo</>}
          </button>
          {monteCarlo ? (
            <dl className="mt-5 grid gap-3 stagger-children">
              <MCMetric label="P10 profit (worst 10%)" value={monteCarlo.p10Profit} fmt={formatCurrency} color="var(--accent-red)" />
              <MCMetric label="Median profit" value={monteCarlo.p50Profit} fmt={formatCurrency} color="var(--accent-amber)" />
              <MCMetric label="P90 profit (best 10%)" value={monteCarlo.p90Profit} fmt={formatCurrency} color="var(--accent-teal)" />
              <MCMetric label="Avg service level" value={monteCarlo.averageServiceLevel} fmt={(n) => formatPercent(n)} color="var(--accent-blue)" />
              <MCMetric label="Worst risk" value={monteCarlo.worstCaseRisk} fmt={formatNumber} color="var(--accent-red)" />
            </dl>
          ) : <p className="mt-5 rounded-lg bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-muted)]">No Monte Carlo run yet.</p>}
        </div>

        <div className="control-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Weekly KPI table</h2>
            <span className="badge badge-teal">{run.weeks.length} rows</span>
          </div>
          <div className="max-h-[420px] overflow-auto rounded-lg border border-[var(--border-subtle)]">
            <table className="data-table">
              <thead><tr>
                <SortTh label="Week" sk="week" cur={sortKey} asc={sortAsc} onSort={handleSort} />
                <SortTh label="Service" sk="serviceLevel" cur={sortKey} asc={sortAsc} onSort={handleSort} />
                <SortTh label="Profit" sk="profit" cur={sortKey} asc={sortAsc} onSort={handleSort} />
                <SortTh label="Inventory" sk="inventoryUnits" cur={sortKey} asc={sortAsc} onSort={handleSort} />
                <SortTh label="Risk" sk="riskScore" cur={sortKey} asc={sortAsc} onSort={handleSort} />
                <SortTh label="Data Quality" sk="dataQualityScore" cur={sortKey} asc={sortAsc} onSort={handleSort} />
              </tr></thead>
              <tbody>{sorted.map(w => (
                <tr key={w.week}>
                  <td className="font-semibold text-[var(--text-primary)]">{w.week}</td>
                  <td>{formatPercent(w.serviceLevel)}</td>
                  <td>{formatCurrency(w.profit)}</td>
                  <td>{formatNumber(w.inventoryUnits)}</td>
                  <td>{formatNumber(w.riskScore)}</td>
                  <td>{formatPercent(w.dataQualityScore)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function MCMetric({ label, value, fmt, color }: { label: string; value: number; fmt: (n: number) => string; color: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 text-xl font-bold" style={{ color }}><AnimatedNumber value={value} format={fmt} /></dd>
    </div>
  )
}

function SortTh({ label, sk, cur, asc, onSort }: { label: string; sk: SortKey; cur: SortKey; asc: boolean; onSort: (k: SortKey) => void }) {
  const active = cur === sk
  return (
    <th className="cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors" onClick={() => onSort(sk)}>
      <span className="inline-flex items-center gap-1">{label}
        <ArrowUpDown size={10} className={active ? 'text-[var(--accent-teal)]' : 'opacity-30'} />
        {active && <span className="text-[0.5rem]">{asc ? '▲' : '▼'}</span>}
      </span>
    </th>
  )
}
