import type { MonteCarloResult, SimulationRun } from '../domain/types'

export function summarizeMonteCarlo(runs: SimulationRun[]): MonteCarloResult {
  const profits = runs.map((run) => run.summary.totalProfit).sort((left, right) => left - right)
  const service = runs.reduce((sum, run) => sum + run.summary.serviceLevel, 0) / runs.length
  const worstCaseRisk = Math.max(...runs.map((run) => run.summary.averageRiskScore))

  return {
    averageServiceLevel: service,
    p10Profit: percentile(profits, 0.1),
    p50Profit: percentile(profits, 0.5),
    p90Profit: percentile(profits, 0.9),
    runs,
    worstCaseRisk,
  }
}

export function runMonteCarloInWorker(input: unknown, iterations = 24): Promise<MonteCarloResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/simulationWorker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<{ runs: SimulationRun[] }>) => {
      resolve(summarizeMonteCarlo(event.data.runs))
      worker.terminate()
    }
    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }
    worker.postMessage({ input, iterations })
  })
}

function percentile(values: number[], target: number) {
  if (values.length === 0) return 0
  const index = Math.min(values.length - 1, Math.max(0, Math.round((values.length - 1) * target)))
  return values[index]
}
