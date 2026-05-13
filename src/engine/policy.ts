import { baselinePolicy } from '../data/network'
import type { DecisionAction, Policy } from '../domain/types'
import { createDecisionAction } from './decisions'

export const decisionPlaybook = [
  {
    action: createDecisionAction('increase_safety_stock', 4, 0.58),
    bestFor: 'Demand shocks and supplier uncertainty',
    tradeoff: 'Improves service level but ties cash in inventory.',
  },
  {
    action: createDecisionAction('diversify_supplier', 7, 0.64),
    bestFor: 'Supplier concentration risk',
    tradeoff: 'Reduces recovery risk but increases landed cost.',
  },
  {
    action: createDecisionAction('expedite_shipping', 10, 0.52),
    bestFor: 'High-margin backlog recovery',
    tradeoff: 'Protects revenue but adds freight cost and carbon impact.',
  },
  {
    action: createDecisionAction('warehouse_rebalance', 11, 0.48),
    bestFor: 'Regional stock imbalance',
    tradeoff: 'Improves service but consumes operational capacity.',
  },
  {
    action: createDecisionAction('demand_shaping', 13, 0.42),
    bestFor: 'Cash or inventory constrained periods',
    tradeoff: 'Protects priority accounts but suppresses some revenue.',
  },
]

export function createPolicyFromControls(overrides: Partial<Policy> = {}): Policy {
  return {
    ...baselinePolicy,
    ...overrides,
  }
}

export function mergeDecision(actions: DecisionAction[], action: DecisionAction) {
  const withoutSame = actions.filter((item) => item.type !== action.type)
  return [...withoutSame, action].sort((left, right) => left.week - right.week)
}
