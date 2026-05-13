import { formatCurrency, formatNumber, formatPercent } from '../domain/format'
import type { PostmortemReport, SimulationRun } from '../domain/types'
import { explainDecision } from './decisions'

export function generatePostmortem(run: SimulationRun): PostmortemReport {
  const worstWeek = [...run.weeks].sort((left, right) => left.serviceLevel - right.serviceLevel)[0]
  const topFinding = [...run.findings].sort((left, right) => right.score - left.score)[0]
  const mainEvent = [...run.events].sort((left, right) => right.severity - left.severity)[0]

  return {
    decisions: run.decisions.map(explainDecision),
    executiveSummary: `OpsTwin simulated ${run.weeks.length} weeks of disruption. The network ended at ${formatPercent(
      run.summary.serviceLevel,
    )} service level, ${formatCurrency(run.summary.totalProfit)} profit, and ${formatNumber(
      run.summary.averageRiskScore,
    )} average risk score.`,
    impact: worstWeek
      ? `The worst week was week ${worstWeek.week}, when service fell to ${formatPercent(
          worstWeek.serviceLevel,
        )}, lost sales hit ${formatNumber(worstWeek.lostSalesUnits)} units, and risk reached ${formatNumber(
          worstWeek.riskScore,
        )}.`
      : 'No impact window was detected.',
    prevention: [
      'Keep supplier diversification above the scenario risk threshold.',
      'Use weekly service-level and inventory-risk alerts before stockouts cascade.',
      'Protect the item master and planning feeds with data quality checks.',
      'Reserve cash for selective expedite moves during recovery windows.',
    ],
    rootCause: mainEvent
      ? `${mainEvent.name} created the primary stress pattern: ${mainEvent.description}`
      : topFinding
        ? topFinding.description
        : 'The baseline network had no severe event-driven root cause.',
    title: mainEvent ? `${mainEvent.name} Recovery Postmortem` : 'Baseline Resilience Postmortem',
  }
}
