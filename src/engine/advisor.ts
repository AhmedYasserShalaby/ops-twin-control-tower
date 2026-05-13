import type { AdvisorRecommendation, DecisionAction, SimulationRun } from '../domain/types'
import { runSimulation, type SimulationInput } from './simulation'
import { decisionPlaybook } from './policy'

export function rankRecommendations(baseInput: SimulationInput, currentRun: SimulationRun): AdvisorRecommendation[] {
  return decisionPlaybook
    .map(({ action }) => scoreAction(action, baseInput, currentRun))
    .sort((left, right) => right.score - left.score)
}

function scoreAction(
  action: DecisionAction,
  baseInput: SimulationInput,
  currentRun: SimulationRun,
): AdvisorRecommendation {
  const nextDecisions = [...(baseInput.decisions ?? []), action]
  const simulated = runSimulation({ ...baseInput, decisions: nextDecisions })
  const expectedProfitDelta = simulated.summary.totalProfit - currentRun.summary.totalProfit
  const expectedServiceDelta = simulated.summary.serviceLevel - currentRun.summary.serviceLevel
  const expectedRiskDelta = currentRun.summary.averageRiskScore - simulated.summary.averageRiskScore
  const expectedCashDelta = simulated.summary.endingCash - currentRun.summary.endingCash
  const score = expectedProfitDelta / 18_000 + expectedServiceDelta * 5.2 + expectedRiskDelta * 3.8 + expectedCashDelta / 60_000

  return {
    action,
    expectedCashDelta,
    expectedProfitDelta,
    expectedRiskDelta,
    expectedServiceDelta,
    rationale: createRationale(action, expectedProfitDelta, expectedServiceDelta, expectedRiskDelta),
    score,
  }
}

function createRationale(action: DecisionAction, profit: number, service: number, risk: number) {
  const serviceText = service >= 0 ? 'raises service level' : 'may lower service level'
  const riskText = risk >= 0 ? 'reduces risk' : 'adds risk'
  const profitText = profit >= 0 ? 'improves profit' : 'costs profit'
  return `${action.name} ${serviceText}, ${riskText}, and ${profitText} under this scenario.`
}
