import { describe, expect, it } from 'vitest'
import { defaultDecisionActions, defaultScenarioEvents } from '../data/network'
import { createDecisionAction } from './decisions'
import { generatePostmortem } from './postmortem'
import { rankRecommendations } from './advisor'
import { runSimulation } from './simulation'

describe('OpsTwin simulation engine', () => {
  it('returns stable seeded outputs', () => {
    const first = runSimulation({ seed: 7 })
    const second = runSimulation({ seed: 7 })

    expect(first.summary.totalProfit).toBe(second.summary.totalProfit)
    expect(first.weeks).toHaveLength(26)
  })

  it('demand and supplier disruptions reduce service level versus baseline', () => {
    const baseline = runSimulation({ decisions: [], events: [], seed: 12 })
    const disrupted = runSimulation({ decisions: [], events: defaultScenarioEvents, seed: 12 })

    expect(disrupted.summary.serviceLevel).toBeLessThan(baseline.summary.serviceLevel)
    expect(disrupted.summary.averageRiskScore).toBeGreaterThan(baseline.summary.averageRiskScore)
  })

  it('response decisions improve service level under disruption', () => {
    const noAction = runSimulation({ decisions: [], events: defaultScenarioEvents, seed: 13 })
    const withAction = runSimulation({ decisions: defaultDecisionActions, events: defaultScenarioEvents, seed: 13 })

    expect(withAction.summary.serviceLevel).toBeGreaterThan(noAction.summary.serviceLevel)
  })

  it('advisor returns ranked action recommendations', () => {
    const run = runSimulation({ decisions: [], events: defaultScenarioEvents, seed: 19 })
    const recommendations = rankRecommendations({ decisions: [], events: defaultScenarioEvents, seed: 19 }, run)

    expect(recommendations).toHaveLength(5)
    expect(recommendations[0].score).toBeGreaterThanOrEqual(recommendations.at(-1)?.score ?? 0)
  })

  it('postmortem includes root cause, impact, decisions, and prevention', () => {
    const run = runSimulation({
      decisions: [createDecisionAction('expedite_shipping', 9, 0.55)],
      events: defaultScenarioEvents,
      seed: 4,
    })
    const report = generatePostmortem(run)

    expect(report.rootCause).toContain('created the primary stress pattern')
    expect(report.impact).toContain('worst week')
    expect(report.decisions).toHaveLength(1)
    expect(report.prevention.length).toBeGreaterThan(2)
  })
})
