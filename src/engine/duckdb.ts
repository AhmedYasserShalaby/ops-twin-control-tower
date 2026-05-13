import * as duckdb from '@duckdb/duckdb-wasm'
import duckdbWasmEh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'
import duckdbWasmMvp from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'
import type { SimulationRun } from '../domain/types'

const bundles: duckdb.DuckDBBundles = {
  eh: {
    mainModule: duckdbWasmEh,
    mainWorker: ehWorker,
  },
  mvp: {
    mainModule: duckdbWasmMvp,
    mainWorker: mvpWorker,
  },
}

let dbPromise: Promise<duckdb.AsyncDuckDB> | undefined

export const presetQueries = [
  {
    label: 'Worst service weeks',
    sql: 'select week, serviceLevel, lostSalesUnits, riskScore from weekly_metrics order by serviceLevel asc limit 8',
  },
  {
    label: 'Profit by risk band',
    sql: "select case when riskScore >= 65 then 'high' when riskScore >= 45 then 'medium' else 'low' end as risk_band, round(sum(profit), 0) as profit from weekly_metrics group by 1 order by profit",
  },
  {
    label: 'Active disruptions',
    sql: 'select week, name, type, severity, durationWeeks from scenario_events order by week',
  },
]

export async function querySimulation(run: SimulationRun, sql: string) {
  const db = await getDb()
  await db.registerFileText('weekly_metrics.json', JSON.stringify(run.weeks))
  await db.registerFileText('scenario_events.json', JSON.stringify(run.events))
  await db.registerFileText('decisions.json', JSON.stringify(run.decisions))
  const connection = await db.connect()
  await connection.query('drop table if exists weekly_metrics')
  await connection.query('drop table if exists scenario_events')
  await connection.query('drop table if exists decisions')
  await connection.insertJSONFromPath('weekly_metrics.json', { name: 'weekly_metrics' })
  await connection.insertJSONFromPath('scenario_events.json', { name: 'scenario_events' })
  await connection.insertJSONFromPath('decisions.json', { name: 'decisions' })
  const result = await connection.query(sql)
  await connection.close()
  return result.toArray().map((row) => row.toJSON() as Record<string, unknown>)
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = initializeDb()
  }
  return dbPromise
}

async function initializeDb() {
  const bundle = await duckdb.selectBundle(bundles)
  const worker = new Worker(bundle.mainWorker!)
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING)
  const db = new duckdb.AsyncDuckDB(logger, worker)
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
  return db
}
