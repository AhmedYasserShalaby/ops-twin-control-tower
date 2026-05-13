import type { ScenarioEvent, ScenarioEventType } from '../domain/types'

const eventMeta: Record<ScenarioEventType, { description: string; name: string }> = {
  cash_constraint: {
    description: 'Treasury reduces available working capital and forces tougher tradeoffs.',
    name: 'Cash Constraint',
  },
  data_quality: {
    description: 'Planning data drifts and reduces confidence in the inventory signal.',
    name: 'Data Quality Drift',
  },
  demand_spike: {
    description: 'Customers pull orders forward and create a fast service-level stress test.',
    name: 'Demand Spike',
  },
  logistics_failure: {
    description: 'A logistics lane loses reliability and increases cycle-time risk.',
    name: 'Logistics Failure',
  },
  supplier_delay: {
    description: 'A supplier misses planned inbound capacity and slows replenishment.',
    name: 'Supplier Delay',
  },
  warehouse_capacity: {
    description: 'Warehouse throughput drops and inventory cannot flow where demand needs it.',
    name: 'Warehouse Capacity Shock',
  },
}

export function createScenarioEvent(
  type: ScenarioEventType,
  week: number,
  severity: number,
  targetId?: string,
): ScenarioEvent {
  const meta = eventMeta[type]
  return {
    description: meta.description,
    durationWeeks: type === 'data_quality' ? 3 : 5,
    id: `${type}-${week}-${targetId ?? 'network'}`,
    name: meta.name,
    severity,
    targetId,
    type,
    week,
  }
}

export function describeScenario(events: ScenarioEvent[]) {
  if (events.length === 0) return 'Stable baseline with normal demand and supplier behavior.'
  const sorted = [...events].sort((left, right) => left.week - right.week)
  return sorted.map((event) => `W${event.week}: ${event.name}`).join(' | ')
}
