import { PageShell } from '../app/AppShell'
import { TrendChart } from '../components/TrendChart'
import { formatCurrency, formatNumber, formatPercent } from '../domain/format'
import { useOpsTwinStore } from '../store/useOpsTwinStore'

export function AnalyticsPage() {
  const run = useOpsTwinStore((state) => state.run)
  const monteCarlo = useOpsTwinStore((state) => state.monteCarlo)
  const runningMonteCarlo = useOpsTwinStore((state) => state.runningMonteCarlo)
  const runMonteCarlo = useOpsTwinStore((state) => state.runMonteCarlo)

  return (
    <PageShell eyebrow="Tradeoff Analysis" title="Analytics workbench">
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Service level trend</h2>
          <TrendChart data={run.weeks} metric="serviceLevel" stroke="#006fbb" />
        </div>
        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Risk score trend</h2>
          <TrendChart data={run.weeks} metric="riskScore" stroke="#e85d3f" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Monte Carlo resilience band</h2>
          <p className="mt-2 text-sm text-[#5d6b63]">
            Runs 24 seeded variants in a web worker to estimate downside and upside under the current scenario.
          </p>
          <button
            type="button"
            className="focus-ring mt-4 rounded-md bg-[#13201b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={runningMonteCarlo}
            onClick={() => void runMonteCarlo()}
          >
            {runningMonteCarlo ? 'Running simulations...' : 'Run Monte Carlo'}
          </button>
          {monteCarlo ? (
            <dl className="mt-5 grid gap-3">
              <Metric label="P10 profit" value={formatCurrency(monteCarlo.p10Profit)} />
              <Metric label="Median profit" value={formatCurrency(monteCarlo.p50Profit)} />
              <Metric label="P90 profit" value={formatCurrency(monteCarlo.p90Profit)} />
              <Metric label="Average service" value={formatPercent(monteCarlo.averageServiceLevel)} />
              <Metric label="Worst risk" value={formatNumber(monteCarlo.worstCaseRisk)} />
            </dl>
          ) : (
            <p className="mt-5 rounded-md bg-[#eef4f0] p-3 text-sm text-[#405449]">
              No Monte Carlo run yet. Use the worker to stress the scenario without blocking the UI.
            </p>
          )}
        </div>

        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Weekly KPI table</h2>
          <div className="mt-4 max-h-[420px] overflow-auto rounded-md border border-[#13201b]/10">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-[#eef4f0]">
                <tr>
                  <Th>Week</Th>
                  <Th>Service</Th>
                  <Th>Profit</Th>
                  <Th>Inventory</Th>
                  <Th>Risk</Th>
                  <Th>Data quality</Th>
                </tr>
              </thead>
              <tbody>
                {run.weeks.map((week) => (
                  <tr key={week.week} className="border-t border-[#13201b]/10">
                    <Td>{week.week}</Td>
                    <Td>{formatPercent(week.serviceLevel)}</Td>
                    <Td>{formatCurrency(week.profit)}</Td>
                    <Td>{formatNumber(week.inventoryUnits)}</Td>
                    <Td>{formatNumber(week.riskScore)}</Td>
                    <Td>{formatPercent(week.dataQualityScore)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#13201b]/10 bg-white p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-[#13201b]">{value}</dd>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#66756b]">{children}</th>
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-3 text-[#405449]">{children}</td>
}
