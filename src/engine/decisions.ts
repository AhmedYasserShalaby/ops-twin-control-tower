import type { DecisionAction, DecisionActionType } from '../domain/types'

const actionMeta: Record<DecisionActionType, { description: string; name: string }> = {
  demand_shaping: {
    description: 'Use allocation and pricing discipline to reduce low-priority demand exposure.',
    name: 'Shape Demand',
  },
  diversify_supplier: {
    description: 'Shift volume to alternate suppliers so recovery does not depend on one source.',
    name: 'Diversify Supplier',
  },
  expedite_shipping: {
    description: 'Buy speed for high-margin orders and protect service level at a cash cost.',
    name: 'Expedite Shipping',
  },
  increase_safety_stock: {
    description: 'Increase buffer stock before the disruption spreads through the network.',
    name: 'Increase Safety Stock',
  },
  warehouse_rebalance: {
    description: 'Move stock across hubs to cover the region with the highest service risk.',
    name: 'Rebalance Warehouses',
  },
}

export function createDecisionAction(type: DecisionActionType, week: number, intensity: number): DecisionAction {
  const meta = actionMeta[type]
  return {
    description: meta.description,
    id: `${type}-${week}`,
    intensity,
    name: meta.name,
    type,
    week,
  }
}

export function explainDecision(action: DecisionAction) {
  const intensity = Math.round(action.intensity * 100)
  return `${action.name} in week ${action.week} at ${intensity}% intensity: ${action.description}`
}
