import { PageShell } from '../app/AppShell'
import { operationsNetwork } from '../data/network'
import { formatNumber } from '../domain/format'
import type { DecisionActionType, ScenarioEventType } from '../domain/types'
import { createDecisionAction } from '../engine/decisions'
import { createScenarioEvent } from '../engine/scenarios'
import { decisionPlaybook } from '../engine/policy'
import { useOpsTwinStore } from '../store/useOpsTwinStore'

const scenarioButtons: Array<{ type: ScenarioEventType; label: string; targetId?: string }> = [
  { label: 'Demand spike', targetId: 'cust-eu', type: 'demand_spike' },
  { label: 'Supplier delay', targetId: 'sup-nova', type: 'supplier_delay' },
  { label: 'Logistics failure', targetId: 'lane-eu-na', type: 'logistics_failure' },
  { label: 'Cash constraint', type: 'cash_constraint' },
  { label: 'Data quality drift', type: 'data_quality' },
]

export function ScenarioPage() {
  const events = useOpsTwinStore((state) => state.events)
  const decisions = useOpsTwinStore((state) => state.decisions)
  const addEvent = useOpsTwinStore((state) => state.addEvent)
  const addDecision = useOpsTwinStore((state) => state.addDecision)
  const removeEvent = useOpsTwinStore((state) => state.removeEvent)
  const removeDecision = useOpsTwinStore((state) => state.removeDecision)
  const reset = useOpsTwinStore((state) => state.reset)

  return (
    <PageShell eyebrow="What-if Studio" title="Scenario builder">
      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="control-surface rounded-md p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]">Stress events</p>
          <h2 className="mt-1 text-xl font-semibold">Trigger disruptions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {scenarioButtons.map((item, index) => (
              <button
                key={item.type}
                type="button"
                className="focus-ring rounded-md border border-[#13201b]/10 bg-[#fbfcf8] p-4 text-left hover:border-[#009b77]"
                onClick={() => addEvent(createScenarioEvent(item.type, 4 + index * 3, 0.26 + index * 0.04, item.targetId))}
              >
                <strong>{item.label}</strong>
                <span className="mt-1 block text-sm text-[#5d6b63]">Adds a timed event into the 26-week recovery window.</span>
              </button>
            ))}
          </div>
        </div>

        <div className="control-surface rounded-md p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]">Decision levers</p>
          <h2 className="mt-1 text-xl font-semibold">Apply response playbooks</h2>
          <div className="mt-4 space-y-3">
            {decisionPlaybook.map((item) => (
              <button
                key={item.action.type}
                type="button"
                className="focus-ring w-full rounded-md border border-[#13201b]/10 bg-white p-4 text-left hover:border-[#009b77]"
                onClick={() =>
                  addDecision(
                    createDecisionAction(
                      item.action.type as DecisionActionType,
                      item.action.week,
                      item.action.intensity,
                    ),
                  )
                }
              >
                <span className="flex items-center justify-between gap-3">
                  <strong>{item.action.name}</strong>
                  <span className="rounded bg-[#e7f7f0] px-2 py-1 text-xs font-bold text-[#006d58]">
                    W{item.action.week}
                  </span>
                </span>
                <span className="mt-1 block text-sm text-[#5d6b63]">{item.tradeoff}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="control-surface rounded-md p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Active disruption timeline</h2>
            <button type="button" className="focus-ring rounded-md px-3 py-2 text-sm font-semibold hover:bg-[#eef4f0]" onClick={reset}>
              Reset
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <article key={event.id} className="rounded-md border border-[#13201b]/10 bg-[#fbfcf8] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong>{event.name}</strong>
                    <p className="mt-1 text-sm text-[#5d6b63]">{event.description}</p>
                  </div>
                  <button type="button" className="focus-ring rounded-md px-2 py-1 text-sm font-semibold text-[#a33820]" onClick={() => removeEvent(event.id)}>
                    Remove
                  </button>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#66756b]">
                  Week {event.week} | {event.durationWeeks} weeks | severity {formatNumber(event.severity * 100)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Active decision log</h2>
          <div className="mt-4 space-y-3">
            {decisions.map((decision) => (
              <article key={decision.id} className="rounded-md border border-[#13201b]/10 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong>{decision.name}</strong>
                    <p className="mt-1 text-sm text-[#5d6b63]">{decision.description}</p>
                  </div>
                  <button type="button" className="focus-ring rounded-md px-2 py-1 text-sm font-semibold text-[#a33820]" onClick={() => removeDecision(decision.id)}>
                    Remove
                  </button>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#66756b]">
                  Week {decision.week} | intensity {formatNumber(decision.intensity * 100)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="control-surface rounded-md p-4">
        <h2 className="text-xl font-semibold">Synthetic network scope</h2>
        <p className="mt-2 text-[#5d6b63]">
          {operationsNetwork.suppliers.length} suppliers, {operationsNetwork.warehouses.length} warehouses,{' '}
          {operationsNetwork.products.length} product families, {operationsNetwork.customerRegions.length} customer regions,
          and {operationsNetwork.lanes.length} movement lanes.
        </p>
      </section>
    </PageShell>
  )
}
