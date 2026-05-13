import { create } from 'zustand'
import { defaultDecisionActions, defaultScenarioEvents } from '../data/network'
import type { DecisionAction, MonteCarloResult, ScenarioEvent, SimulationRun } from '../domain/types'
import { mergeDecision } from '../engine/policy'
import { runMonteCarloInWorker } from '../engine/monteCarlo'
import { runSimulation } from '../engine/simulation'

interface OpsTwinState {
  decisions: DecisionAction[]
  events: ScenarioEvent[]
  monteCarlo?: MonteCarloResult
  run: SimulationRun
  runningMonteCarlo: boolean
  addDecision: (decision: DecisionAction) => void
  addEvent: (event: ScenarioEvent) => void
  removeDecision: (id: string) => void
  removeEvent: (id: string) => void
  reset: () => void
  runMonteCarlo: () => Promise<void>
}

function buildRun(events: ScenarioEvent[], decisions: DecisionAction[]) {
  return runSimulation({ decisions, events })
}

export const useOpsTwinStore = create<OpsTwinState>((set, get) => ({
  decisions: defaultDecisionActions,
  events: defaultScenarioEvents,
  run: buildRun(defaultScenarioEvents, defaultDecisionActions),
  runningMonteCarlo: false,
  addDecision: (decision) => {
    const decisions = mergeDecision(get().decisions, decision)
    set({ decisions, monteCarlo: undefined, run: buildRun(get().events, decisions) })
  },
  addEvent: (event) => {
    const events = [...get().events.filter((item) => item.id !== event.id), event].sort((left, right) => left.week - right.week)
    set({ events, monteCarlo: undefined, run: buildRun(events, get().decisions) })
  },
  removeDecision: (id) => {
    const decisions = get().decisions.filter((item) => item.id !== id)
    set({ decisions, monteCarlo: undefined, run: buildRun(get().events, decisions) })
  },
  removeEvent: (id) => {
    const events = get().events.filter((item) => item.id !== id)
    set({ events, monteCarlo: undefined, run: buildRun(events, get().decisions) })
  },
  reset: () => set({
    decisions: defaultDecisionActions,
    events: defaultScenarioEvents,
    monteCarlo: undefined,
    run: buildRun(defaultScenarioEvents, defaultDecisionActions),
  }),
  runMonteCarlo: async () => {
    const { decisions, events } = get()
    set({ runningMonteCarlo: true })
    const monteCarlo = await runMonteCarloInWorker({ decisions, events })
    set({ monteCarlo, runningMonteCarlo: false })
  },
}))
