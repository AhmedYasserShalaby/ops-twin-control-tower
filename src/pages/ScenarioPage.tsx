import { PageShell } from '../app/AppShell'
import { operationsNetwork } from '../data/network'
import { formatNumber } from '../domain/format'
import type { DecisionActionType, ScenarioEventType } from '../domain/types'
import { createDecisionAction } from '../engine/decisions'
import { createScenarioEvent } from '../engine/scenarios'
import { decisionPlaybook } from '../engine/policy'
import { useOpsTwinStore } from '../store/useOpsTwinStore'
import {
  AlertTriangle,
  CloudLightning,
  DollarSign,
  FileWarning,
  Package,
  RotateCcw,
  Truck,
  TrendingUp,
  X,
  Zap,
  Shield,
  RefreshCw,
  BarChart3,
  ArrowDownRight,
} from 'lucide-react'

const scenarioButtons: Array<{
  type: ScenarioEventType
  label: string
  description: string
  targetId?: string
  icon: typeof AlertTriangle
  color: string
}> = [
  {
    type: 'demand_spike',
    label: 'Demand Spike',
    description: 'Customers pull orders forward, stressing service levels.',
    targetId: 'cust-eu',
    icon: TrendingUp,
    color: 'var(--accent-amber)',
  },
  {
    type: 'supplier_delay',
    label: 'Supplier Delay',
    description: 'A key supplier misses shipments, slowing replenishment.',
    targetId: 'sup-nova',
    icon: Package,
    color: 'var(--accent-red)',
  },
  {
    type: 'logistics_failure',
    label: 'Logistics Failure',
    description: 'A transport lane loses reliability, increasing delays.',
    targetId: 'lane-eu-na',
    icon: Truck,
    color: 'var(--accent-red)',
  },
  {
    type: 'cash_constraint',
    label: 'Cash Constraint',
    description: 'Working capital drops, forcing tougher tradeoffs.',
    icon: DollarSign,
    color: 'var(--accent-amber)',
  },
  {
    type: 'data_quality',
    label: 'Data Quality Drift',
    description: 'Planning data becomes unreliable, hurting decisions.',
    icon: FileWarning,
    color: 'var(--accent-blue)',
  },
]

const decisionIcons: Record<string, typeof Shield> = {
  increase_safety_stock: Shield,
  diversify_supplier: RefreshCw,
  expedite_shipping: Zap,
  warehouse_rebalance: BarChart3,
  demand_shaping: ArrowDownRight,
}

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
      {/* Visual Timeline */}
      <section className="control-surface rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">26-week timeline</p>
            <h2 className="text-lg font-bold">Active events & decisions</h2>
          </div>
          <button type="button" className="btn-secondary" onClick={reset}>
            <RotateCcw size={14} />
            Reset all
          </button>
        </div>

        {/* Timeline bar */}
        <div className="relative mt-2">
          {/* Week markers */}
          <div className="flex justify-between text-[0.625rem] text-[var(--text-muted)] mb-1 px-0.5">
            {[1, 5, 10, 15, 20, 26].map((w) => (
              <span key={w}>W{w}</span>
            ))}
          </div>
          <div className="relative h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden">
            {/* Event blocks */}
            {events.map((event) => {
              const left = ((event.week - 1) / 25) * 100
              const width = (event.durationWeeks / 25) * 100
              return (
                <div
                  key={event.id}
                  className="absolute top-1 h-3.5 rounded-sm opacity-70 transition-all hover:opacity-100"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 2)}%`,
                    background: 'var(--accent-red)',
                  }}
                  title={`${event.name}: W${event.week}–W${event.week + event.durationWeeks}`}
                />
              )
            })}
            {/* Decision blocks */}
            {decisions.map((d) => {
              const left = ((d.week - 1) / 25) * 100
              return (
                <div
                  key={d.id}
                  className="absolute bottom-1 h-3.5 w-2 rounded-sm opacity-70 transition-all hover:opacity-100"
                  style={{
                    left: `${left}%`,
                    background: 'var(--accent-teal)',
                  }}
                  title={`${d.name}: W${d.week}`}
                />
              )
            })}
          </div>
          <div className="flex gap-4 mt-2 text-[0.625rem] text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-[var(--accent-red)]" /> Disruptions</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-[var(--accent-teal)]" /> Decisions</span>
          </div>
        </div>
      </section>

      {/* Scenario & Decision buttons */}
      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="control-surface rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <CloudLightning size={16} className="text-[var(--accent-amber)]" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Stress events</p>
          </div>
          <h2 className="text-lg font-bold">Trigger disruptions</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Click to add a disruption event into the simulation</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {scenarioButtons.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.type}
                  aria-label={`Add scenario: ${item.label}`}
                  type="button"
                  className="focus-ring interactive-card rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-left"
                  onClick={() => addEvent(createScenarioEvent(item.type, 4 + index * 3, 0.26 + index * 0.04, item.targetId))}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid size-8 place-items-center rounded-lg"
                      style={{ background: `${item.color}18`, color: item.color }}
                    >
                      <Icon size={16} />
                    </span>
                    <strong className="text-sm text-[var(--text-primary)]">{item.label}</strong>
                  </div>
                  <span className="mt-2 block text-xs text-[var(--text-muted)]">{item.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="control-surface rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-[var(--accent-teal)]" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Response playbooks</p>
          </div>
          <h2 className="text-lg font-bold">Apply decisions</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Counter disruptions with strategic responses</p>

          <div className="mt-4 space-y-3">
            {decisionPlaybook.map((item) => {
              const Icon = decisionIcons[item.action.type] || Shield
              return (
                <button
                  key={item.action.type}
                  type="button"
                  className="focus-ring interactive-card w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-left"
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]">
                        <Icon size={16} />
                      </span>
                      <strong className="text-sm text-[var(--text-primary)]">{item.action.name}</strong>
                    </div>
                    <span className="badge badge-teal">W{item.action.week}</span>
                  </div>
                  <span className="mt-2 block text-xs text-[var(--text-muted)]">{item.tradeoff}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Active logs */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="control-surface rounded-xl p-5">
          <h2 className="text-lg font-bold">Active disruptions</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{events.length} events in timeline</p>

          <div className="mt-4 space-y-3 stagger-children">
            {events.map((event) => (
              <article key={event.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-sm text-[var(--text-primary)]">{event.name}</strong>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{event.description}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove event ${event.name}`}
                    className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => removeEvent(event.id)}
                  >
                    <X size={12} />
                    Remove
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="badge badge-red">W{event.week}</span>
                  <span className="badge badge-amber">{event.durationWeeks} weeks</span>
                  <span className="badge badge-blue">severity {formatNumber(event.severity * 100)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="control-surface rounded-xl p-5">
          <h2 className="text-lg font-bold">Active decisions</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{decisions.length} decisions applied</p>

          <div className="mt-4 space-y-3 stagger-children">
            {decisions.map((decision) => (
              <article key={decision.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-sm text-[var(--text-primary)]">{decision.name}</strong>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{decision.description}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove decision ${decision.name}`}
                    className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => removeDecision(decision.id)}
                  >
                    <X size={12} />
                    Remove
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="badge badge-teal">W{decision.week}</span>
                  <span className="badge badge-blue">intensity {formatNumber(decision.intensity * 100)}%</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Network scope */}
      <section className="control-surface rounded-xl p-5">
        <h2 className="text-lg font-bold">Synthetic network scope</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { label: 'Suppliers', count: operationsNetwork.suppliers.length },
            { label: 'Warehouses', count: operationsNetwork.warehouses.length },
            { label: 'Products', count: operationsNetwork.products.length },
            { label: 'Regions', count: operationsNetwork.customerRegions.length },
            { label: 'Lanes', count: operationsNetwork.lanes.length },
          ].map((item) => (
            <span key={item.label} className="badge badge-teal">{item.count} {item.label}</span>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
