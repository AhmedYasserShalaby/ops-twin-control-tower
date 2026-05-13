import { PageShell } from '../app/AppShell'
import { KpiCard } from '../components/KpiCard'
import { TrendChart } from '../components/TrendChart'
import { formatCurrency, formatNumber, formatPercent } from '../domain/format'
import { useAdvisorRecommendations, useOpsTwinStore } from '../store/useOpsTwinStore'
import { AlertTriangle, Banknote, Boxes, Gauge, ShieldAlert, Sparkles } from 'lucide-react'

export function CommandCenterPage() {
  const run = useOpsTwinStore((state) => state.run)
  const addDecision = useOpsTwinStore((state) => state.addDecision)
  const recommendations = useAdvisorRecommendations()
  const topRecommendation = recommendations[0]
  const finalWeek = run.weeks.at(-1)

  return (
    <PageShell eyebrow="Enterprise Resilience Twin" title="Command center">
      <section className="dark-surface overflow-hidden rounded-md p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9edbc8]">Live synthetic operation</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Stress-test disruption decisions before they hit revenue.
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[#dcece5]">
              OpsTwin models suppliers, warehouses, lanes, products, service levels, cash, and risk across a 26-week
              recovery window. It is a product-style proof of business systems thinking, not another passive dashboard.
            </p>
          </div>
          <div className="glass-panel rounded-md p-4 text-[#13201b]">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#009b77] text-white">
                <Sparkles size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]">Advisor move</p>
                <h3 className="mt-1 text-xl font-semibold">{topRecommendation.action.name}</h3>
                <p className="mt-2 text-sm text-[#526157]">{topRecommendation.rationale}</p>
                <button
                  type="button"
                  className="focus-ring mt-4 rounded-md bg-[#13201b] px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => addDecision(topRecommendation.action)}
                >
                  Apply recommendation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          detail="Weighted fulfilled demand"
          icon={<Gauge size={18} />}
          label="Service level"
          tone={run.summary.serviceLevel >= 92 ? 'good' : 'risk'}
          value={formatPercent(run.summary.serviceLevel)}
        />
        <KpiCard
          detail="26-week simulated total"
          icon={<Banknote size={18} />}
          label="Profit"
          tone={run.summary.totalProfit > 0 ? 'good' : 'risk'}
          value={formatCurrency(run.summary.totalProfit)}
        />
        <KpiCard
          detail={`${formatNumber(run.summary.stockoutIncidents)} weekly product breaches`}
          icon={<Boxes size={18} />}
          label="Stockouts"
          tone={run.summary.stockoutIncidents < 20 ? 'good' : 'risk'}
          value={formatNumber(run.summary.stockoutIncidents)}
        />
        <KpiCard
          detail="Average cross-network exposure"
          icon={<ShieldAlert size={18} />}
          label="Risk score"
          tone={run.summary.averageRiskScore < 45 ? 'good' : 'risk'}
          value={formatNumber(run.summary.averageRiskScore)}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="control-surface rounded-md p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]">Recovery curve</p>
              <h2 className="text-xl font-semibold">Profit through disruption</h2>
            </div>
            <span className="rounded-md bg-[#e7f7f0] px-3 py-1 text-sm font-semibold text-[#006d58]">26 weeks</span>
          </div>
          <TrendChart data={run.weeks} metric="profit" />
        </div>

        <div className="control-surface rounded-md p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[#e85d3f]" size={20} aria-hidden="true" />
            <h2 className="text-xl font-semibold">Current pressure</h2>
          </div>
          <div className="mt-4 space-y-3">
            {run.findings.slice(0, 5).map((finding) => (
              <article key={finding.id} className="rounded-md border border-[#13201b]/10 bg-[#fbfcf8] p-3">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm">{finding.title}</strong>
                  <span className="rounded bg-[#fff0eb] px-2 py-1 text-xs font-bold uppercase text-[#a33820]">
                    {finding.tier}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#5d6b63]">{finding.description}</p>
              </article>
            ))}
            {finalWeek ? (
              <p className="rounded-md bg-[#eef4f0] p-3 text-sm text-[#405449]">
                Week {finalWeek.week} closes with {formatCurrency(finalWeek.cashBalance)} cash and{' '}
                {formatNumber(finalWeek.inventoryUnits)} units across the network.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
