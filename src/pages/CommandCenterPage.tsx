import { PageShell } from '../app/AppShell'
import { KpiCard } from '../components/KpiCard'
import { TrendChart } from '../components/TrendChart'
import { formatCurrency, formatNumber, formatPercent } from '../domain/format'
import { rankRecommendations } from '../engine/advisor'
import { useOpsTwinStore } from '../store/useOpsTwinStore'
import { AlertTriangle, Banknote, Boxes, Check, Gauge, ShieldAlert, Sparkles, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'

// Pre-computed particle positions to keep render pure
const PARTICLE_DOTS = [
  { size: 3, x: 12, y: 8, duration: 3.2, delay: 0.1 },
  { size: 5, x: 28, y: 42, duration: 4.1, delay: 0.8 },
  { size: 2, x: 45, y: 15, duration: 2.8, delay: 1.4 },
  { size: 4, x: 67, y: 72, duration: 3.6, delay: 0.3 },
  { size: 3, x: 82, y: 25, duration: 4.5, delay: 1.9 },
  { size: 5, x: 15, y: 65, duration: 2.5, delay: 0.6 },
  { size: 2, x: 91, y: 88, duration: 3.9, delay: 1.1 },
  { size: 4, x: 38, y: 91, duration: 3.1, delay: 0.4 },
  { size: 3, x: 72, y: 48, duration: 4.3, delay: 1.7 },
  { size: 5, x: 55, y: 33, duration: 2.9, delay: 0.9 },
  { size: 2, x: 8, y: 78, duration: 3.7, delay: 1.3 },
  { size: 4, x: 95, y: 55, duration: 4.0, delay: 0.2 },
  { size: 3, x: 33, y: 18, duration: 3.4, delay: 1.6 },
  { size: 5, x: 78, y: 82, duration: 2.6, delay: 0.7 },
  { size: 2, x: 48, y: 60, duration: 4.2, delay: 1.0 },
]

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
    <PageShell eyebrow="Enterprise Resilience Twin" title="Command center">
      {/* Hero Section */}
      <section className="dark-surface relative overflow-hidden rounded-2xl p-6 sm:p-8">
        {/* Animated dots background — positions pre-computed to stay pure */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {PARTICLE_DOTS.map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                background: 'var(--accent-teal)',
                animation: `pulseGlow ${dot.duration}s ease-in-out infinite`,
                animationDelay: `${dot.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="badge badge-teal">
                <span className="inline-block size-1.5 rounded-full bg-[var(--accent-teal)] animate-live-pulse" />
                Live Simulation
              </span>
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Stress-test disruption decisions before they hit revenue.
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[var(--text-secondary)]">
              OpsTwin models your entire supply chain — suppliers, warehouses, lanes, products, service levels,
              cash, and risk — across a 26-week recovery window. Try adding disruptions and see what happens.
            </p>
          </div>

          {/* Advisor Card */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--accent-teal)] text-[var(--bg-base)]">
                <Sparkles size={18} aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">AI Advisor</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">{topRecommendation.action.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{topRecommendation.rationale}</p>

                {/* Impact preview */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {topRecommendation.expectedProfitDelta !== 0 && (
                    <span className={`badge ${topRecommendation.expectedProfitDelta > 0 ? 'badge-teal' : 'badge-red'}`}>
                      {topRecommendation.expectedProfitDelta > 0 ? '+' : ''}{formatCurrency(topRecommendation.expectedProfitDelta)} profit
                    </span>
                  )}
                  {topRecommendation.expectedServiceDelta !== 0 && (
                    <span className={`badge ${topRecommendation.expectedServiceDelta > 0 ? 'badge-teal' : 'badge-red'}`}>
                      {topRecommendation.expectedServiceDelta > 0 ? '+' : ''}{topRecommendation.expectedServiceDelta.toFixed(1)}% service
                    </span>
                  )}
                </div>

                <button
                  aria-label={`Apply advisor recommendation: ${topRecommendation.action.name}`}
                  type="button"
                  className={`focus-ring mt-4 ${applied === topRecommendation.action.id ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleApply(topRecommendation)}
                >
                  {applied === topRecommendation.action.id ? (
                    <>
                      <Check size={16} />
                      Applied!
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Apply recommendation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
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
          detail="Average cross-network exposure"
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

      {/* Charts & Findings */}
      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="control-surface rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Recovery curve</p>
              <h2 className="text-lg font-bold">Profit through disruption</h2>
            </div>
            <span className="badge badge-teal">26 weeks</span>
          </div>
          <TrendChart data={run.weeks} metric="profit" events={events} />
        </div>

        <div className="control-surface rounded-xl p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[var(--accent-amber)]" size={18} aria-hidden="true" />
            <h2 className="text-lg font-bold">Current pressure</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Key risk findings from the simulation</p>

          <div className="mt-4 space-y-3 stagger-children">
            {run.findings.slice(0, 5).map((finding) => {
              const tierColor = {
                critical: 'var(--accent-red)',
                high: 'var(--accent-amber)',
                medium: 'var(--accent-blue)',
                low: 'var(--accent-teal)',
              }[finding.tier]

              return (
                <article
                  key={finding.id}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 transition-all hover:border-[var(--border-default)]"
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
              <p className="rounded-lg bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-secondary)]">
                📊 Week {finalWeek.week} closes with <strong>{formatCurrency(finalWeek.cashBalance)}</strong> cash and{' '}
                <strong>{formatNumber(finalWeek.inventoryUnits)}</strong> units across the network.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
