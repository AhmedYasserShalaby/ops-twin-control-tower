import { useMemo, useState } from 'react'
import { AlertTriangle, Banknote, Boxes, Check, Gauge, ShieldAlert, Wrench } from 'lucide-react'
import { PageShell } from '../app/AppShell'
import { KpiCard } from '../components/KpiCard'
import { TrendChart } from '../components/TrendChart'
import { formatCurrency, formatNumber, formatPercent } from '../domain/format'
import { rankRecommendations } from '../engine/advisor'
import { useOpsTwinStore } from '../store/useOpsTwinStore'

export function CommandCenterPage() {
  const run = useOpsTwinStore((state) => state.run)
  const decisions = useOpsTwinStore((state) => state.decisions)
  const events = useOpsTwinStore((state) => state.events)
  const addDecision = useOpsTwinStore((state) => state.addDecision)
  const [applied, setApplied] = useState<string | null>(null)

  const recommendations = useMemo(
    () => rankRecommendations({ decisions, events }, run),
    [decisions, events, run],
  )
  const topRecommendation = recommendations[0]
  const finalWeek = run.weeks.at(-1)

  function handleApply(rec: typeof topRecommendation) {
    addDecision(rec.action)
    setApplied(rec.action.id)
    setTimeout(() => setApplied(null), 2000)
  }

  return (
    <PageShell eyebrow="Operations review" title="Command center">
      <section className="dark-surface rounded-lg p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <span className="badge badge-teal">26-week model</span>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              Test supply chain decisions before the cost shows up.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
              Add disruptions, choose responses, and compare service level, profit, inventory, cash, and risk.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]">
                <Wrench size={18} aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Recommended next move</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">{topRecommendation.action.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{topRecommendation.rationale}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {topRecommendation.expectedProfitDelta !== 0 ? (
                    <span className={`badge ${topRecommendation.expectedProfitDelta > 0 ? 'badge-teal' : 'badge-red'}`}>
                      {topRecommendation.expectedProfitDelta > 0 ? '+' : ''}{formatCurrency(topRecommendation.expectedProfitDelta)} profit
                    </span>
                  ) : null}
                  {topRecommendation.expectedServiceDelta !== 0 ? (
                    <span className={`badge ${topRecommendation.expectedServiceDelta > 0 ? 'badge-teal' : 'badge-red'}`}>
                      {topRecommendation.expectedServiceDelta > 0 ? '+' : ''}{topRecommendation.expectedServiceDelta.toFixed(1)}% service
                    </span>
                  ) : null}
                </div>

                <button
                  aria-label={`Apply recommended action: ${topRecommendation.action.name}`}
                  type="button"
                  className={`focus-ring mt-4 ${applied === topRecommendation.action.id ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleApply(topRecommendation)}
                >
                  {applied === topRecommendation.action.id ? (
                    <>
                      <Check size={16} />
                      Applied
                    </>
                  ) : (
                    <>
                      <Wrench size={16} />
                      Apply action
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stagger-children grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          detail="Weighted fulfilled demand"
          icon={<Gauge size={18} />}
          label="Service level"
          tone={run.summary.serviceLevel >= 92 ? 'good' : 'risk'}
          value={formatPercent(run.summary.serviceLevel)}
          numericValue={run.summary.serviceLevel}
          format={(n) => formatPercent(n)}
          sparkData={run.weeks.map((w) => w.serviceLevel)}
          tooltip="% of customer demand fulfilled on time"
        />
        <KpiCard
          detail="26-week simulated total"
          icon={<Banknote size={18} />}
          label="Profit"
          tone={run.summary.totalProfit > 0 ? 'good' : 'risk'}
          value={formatCurrency(run.summary.totalProfit)}
          numericValue={run.summary.totalProfit}
          format={(n) => formatCurrency(n)}
          sparkData={run.weeks.map((w) => w.profit)}
          tooltip="Total profit across the simulation window"
        />
        <KpiCard
          detail={`${formatNumber(run.summary.stockoutIncidents)} weekly product breaches`}
          icon={<Boxes size={18} />}
          label="Stockouts"
          tone={run.summary.stockoutIncidents < 20 ? 'good' : 'risk'}
          value={formatNumber(run.summary.stockoutIncidents)}
          numericValue={run.summary.stockoutIncidents}
          format={(n) => formatNumber(n)}
          sparkData={run.weeks.map((w) => w.stockoutIncidents)}
          tooltip="Times when demand exceeded available inventory"
        />
        <KpiCard
          detail="Average network exposure"
          icon={<ShieldAlert size={18} />}
          label="Risk score"
          tone={run.summary.averageRiskScore < 45 ? 'good' : 'risk'}
          value={formatNumber(run.summary.averageRiskScore)}
          numericValue={run.summary.averageRiskScore}
          format={(n) => formatNumber(n)}
          sparkData={run.weeks.map((w) => w.riskScore)}
          tooltip="Composite risk across suppliers, logistics, and inventory"
        />
      </section>

      <section className="grid items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="control-surface rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Recovery curve</p>
              <h2 className="text-lg font-bold">Profit through disruption</h2>
            </div>
            <span className="badge badge-teal">26 weeks</span>
          </div>
          <TrendChart data={run.weeks} metric="profit" events={events} />
        </div>

        <div className="control-surface rounded-lg p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[var(--accent-amber)]" size={18} aria-hidden="true" />
            <h2 className="text-lg font-bold">Current pressure</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Largest risks in this run.</p>

          <div className="mt-4 space-y-3 stagger-children">
            {run.findings.slice(0, 3).map((finding) => {
              const tierColor = {
                critical: 'var(--accent-red)',
                high: 'var(--accent-amber)',
                medium: 'var(--accent-blue)',
                low: 'var(--accent-teal)',
              }[finding.tier]

              return (
                <article
                  key={finding.id}
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-[var(--text-primary)]">{finding.title}</strong>
                    <span
                      className="badge"
                      style={{
                        color: tierColor,
                        background: `${tierColor}18`,
                      }}
                    >
                      {finding.tier}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{finding.description}</p>
                  <div className="severity-bar mt-2">
                    <div
                      className="severity-bar-fill"
                      style={{
                        width: `${Math.min(finding.score * 100 / 80, 100)}%`,
                        background: tierColor,
                      }}
                    />
                  </div>
                </article>
              )
            })}
            {finalWeek ? (
              <p className="rounded-md bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-secondary)]">
                Week {finalWeek.week} closes with <strong>{formatCurrency(finalWeek.cashBalance)}</strong> cash and{' '}
                <strong>{formatNumber(finalWeek.inventoryUnits)}</strong> units across the network.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
