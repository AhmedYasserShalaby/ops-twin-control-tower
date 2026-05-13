import { runSimulation, type SimulationInput } from '../engine/simulation'

export interface WorkerRequest {
  input: SimulationInput
  iterations: number
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { input, iterations } = event.data
  const runs = Array.from({ length: iterations }, (_, index) =>
    runSimulation({ ...input, seed: (input.seed ?? 42) + index * 17 }),
  )
  self.postMessage({ runs })
}
