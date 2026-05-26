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
  fullRun: SimulationRun
  run: SimulationRun
  runningMonteCarlo: boolean
  
  // Playback state
  isPlaying: boolean
  currentPlayWeek: number
  playbackSpeed: number
  isPlaybackCompleted: boolean

  // Baseline comparison
  baselineRun?: SimulationRun

  addDecision: (decision: DecisionAction) => void
  addEvent: (event: ScenarioEvent) => void
  removeDecision: (id: string) => void
  removeEvent: (id: string) => void
  reset: () => void
  runMonteCarlo: () => Promise<void>

  // Playback actions
  startPlayback: () => void
  pausePlayback: () => void
  resetPlayback: () => void
  setPlaybackSpeed: (speed: number) => void
  setPlayWeek: (week: number) => void

  // Baseline actions
  saveAsBaseline: () => void
  clearBaseline: () => void
}

function buildRun(events: ScenarioEvent[], decisions: DecisionAction[]) {
  return runSimulation({ decisions, events })
}

function sliceRun(run: SimulationRun, currentPlayWeek: number): SimulationRun {
  if (currentPlayWeek >= 26) return run
  const slicedWeeks = run.weeks.slice(0, currentPlayWeek)
  const slicedFindings = run.findings.filter((f) => f.week <= currentPlayWeek)

  // Re-calculate summary for the sliced weeks
  const totalRevenue = slicedWeeks.reduce((sum, w) => sum + w.revenue, 0)
  const totalProfit = slicedWeeks.reduce((sum, w) => sum + w.profit, 0)
  const totalDemand = slicedWeeks.reduce((sum, w) => sum + w.demandUnits, 0)
  const totalFulfilled = slicedWeeks.reduce((sum, w) => sum + w.fulfilledUnits, 0)
  const averageInventoryValue = slicedWeeks.length > 0
    ? slicedWeeks.reduce((sum, w) => sum + w.inventoryValue, 0) / slicedWeeks.length
    : 0

  const averageRiskScore = slicedWeeks.length > 0
    ? slicedWeeks.reduce((sum, w) => sum + w.riskScore, 0) / slicedWeeks.length
    : 0

  const averageDataQualityScore = slicedWeeks.length > 0
    ? slicedWeeks.reduce((sum, w) => sum + w.dataQualityScore, 0) / slicedWeeks.length
    : 0

  const averageCarbonIndex = slicedWeeks.length > 0
    ? slicedWeeks.reduce((sum, w) => sum + w.carbonIndex, 0) / slicedWeeks.length
    : 0

  const summary = {
    averageDataQualityScore,
    averageRiskScore,
    carbonIndex: averageCarbonIndex,
    endingCash: slicedWeeks.at(-1)?.cashBalance ?? 1850000,
    inventoryTurnover: averageInventoryValue > 0 ? totalRevenue / averageInventoryValue : 0,
    serviceLevel: totalDemand > 0 ? (totalFulfilled / totalDemand) * 100 : 100,
    stockoutIncidents: slicedWeeks.reduce((sum, w) => sum + w.stockoutIncidents, 0),
    totalProfit,
    totalRevenue,
  }

  return {
    ...run,
    summary,
    weeks: slicedWeeks,
    findings: slicedFindings,
  }
}

let playbackInterval: ReturnType<typeof setInterval> | null = null

export const useOpsTwinStore = create<OpsTwinState>((set, get) => ({
  decisions: defaultDecisionActions,
  events: defaultScenarioEvents,
  fullRun: buildRun(defaultScenarioEvents, defaultDecisionActions),
  run: buildRun(defaultScenarioEvents, defaultDecisionActions),
  runningMonteCarlo: false,

  // Playback state defaults
  isPlaying: false,
  currentPlayWeek: 26,
  playbackSpeed: 1,
  isPlaybackCompleted: true,

  addDecision: (decision) => {
    const decisions = mergeDecision(get().decisions, decision)
    const fullRun = buildRun(get().events, decisions)
    set({
      decisions,
      monteCarlo: undefined,
      fullRun,
      run: sliceRun(fullRun, get().currentPlayWeek),
    })
  },
  addEvent: (event) => {
    const events = [...get().events.filter((item) => item.id !== event.id), event].sort((left, right) => left.week - right.week)
    const fullRun = buildRun(events, get().decisions)
    set({
      events,
      monteCarlo: undefined,
      fullRun,
      run: sliceRun(fullRun, get().currentPlayWeek),
    })
  },
  removeDecision: (id) => {
    const decisions = get().decisions.filter((item) => item.id !== id)
    const fullRun = buildRun(get().events, decisions)
    set({
      decisions,
      monteCarlo: undefined,
      fullRun,
      run: sliceRun(fullRun, get().currentPlayWeek),
    })
  },
  removeEvent: (id) => {
    const events = get().events.filter((item) => item.id !== id)
    const fullRun = buildRun(events, get().decisions)
    set({
      events,
      monteCarlo: undefined,
      fullRun,
      run: sliceRun(fullRun, get().currentPlayWeek),
    })
  },
  reset: () => {
    if (playbackInterval) {
      clearInterval(playbackInterval)
      playbackInterval = null
    }
    const fullRun = buildRun(defaultScenarioEvents, defaultDecisionActions)
    set({
      decisions: defaultDecisionActions,
      events: defaultScenarioEvents,
      monteCarlo: undefined,
      fullRun,
      run: fullRun,
      isPlaying: false,
      currentPlayWeek: 26,
      playbackSpeed: 1,
      isPlaybackCompleted: true,
    })
  },
  runMonteCarlo: async () => {
    const { decisions, events } = get()
    set({ runningMonteCarlo: true })
    const monteCarlo = await runMonteCarloInWorker({ decisions, events })
    set({ monteCarlo, runningMonteCarlo: false })
  },

  // Playback actions
  startPlayback: () => {
    if (playbackInterval) clearInterval(playbackInterval)

    let startWeek = get().currentPlayWeek
    if (startWeek >= 26) {
      startWeek = 1
    }

    set({ isPlaying: true, currentPlayWeek: startWeek, isPlaybackCompleted: false })
    // Update active slice immediately for the start week
    set({ run: sliceRun(get().fullRun, startWeek) })

    const tick = () => {
      const { currentPlayWeek, pausePlayback } = get()
      if (currentPlayWeek >= 26) {
        pausePlayback()
        set({ isPlaybackCompleted: true })
        return
      }
      set((state) => {
        const nextWeek = state.currentPlayWeek + 1
        return {
          currentPlayWeek: nextWeek,
          isPlaybackCompleted: nextWeek >= 26,
          run: sliceRun(state.fullRun, nextWeek),
        }
      })
    }

    playbackInterval = setInterval(tick, 1000 / get().playbackSpeed)
  },
  pausePlayback: () => {
    if (playbackInterval) {
      clearInterval(playbackInterval)
      playbackInterval = null
    }
    set({ isPlaying: false })
  },
  resetPlayback: () => {
    if (playbackInterval) {
      clearInterval(playbackInterval)
      playbackInterval = null
    }
    set((state) => ({
      isPlaying: false,
      currentPlayWeek: 26,
      isPlaybackCompleted: true,
      run: state.fullRun,
    }))
  },
  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: speed })
    if (get().isPlaying) {
      get().startPlayback() // restart interval with new speed
    }
  },
  setPlayWeek: (week) => {
    set((state) => ({
      currentPlayWeek: week,
      isPlaybackCompleted: week >= 26,
      run: sliceRun(state.fullRun, week),
    }))
  },

  // Baseline actions
  saveAsBaseline: () => {
    set((state) => ({ baselineRun: state.fullRun }))
  },
  clearBaseline: () => {
    set({ baselineRun: undefined })
  },
}))

