import { PageShell } from '../app/AppShell'
import { useState } from 'react'
import { presetQueries, querySimulation } from '../engine/duckdb'
import { useOpsTwinStore } from '../store/useOpsTwinStore'

export function SqlLabPage() {
  const run = useOpsTwinStore((state) => state.run)
  const [sql, setSql] = useState(presetQueries[0].sql)
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function executeQuery(nextSql = sql) {
    setLoading(true)
    setError('')
    try {
      const result = await querySimulation(run, nextSql)
      setRows(result)
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Query failed')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const columns = rows[0] ? Object.keys(rows[0]) : []

  return (
    <PageShell eyebrow="Browser SQL" title="In-browser DuckDB lab">
      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Preset analytical queries</h2>
          <p className="mt-2 text-sm text-[#5d6b63]">
            DuckDB-Wasm loads the generated simulation tables directly in the browser. No backend, no credentials.
          </p>
          <div className="mt-4 space-y-3">
            {presetQueries.map((query) => (
              <button
                key={query.label}
                type="button"
                className="focus-ring w-full rounded-md border border-[#13201b]/10 bg-white p-3 text-left text-sm font-semibold hover:border-[#009b77]"
                onClick={() => {
                  setSql(query.sql)
                  void executeQuery(query.sql)
                }}
              >
                {query.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-surface rounded-md p-4">
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]" htmlFor="sql-editor">
            SQL editor
          </label>
          <textarea
            id="sql-editor"
            className="focus-ring mt-2 min-h-36 w-full rounded-md border border-[#13201b]/10 bg-[#fbfcf8] p-3 font-mono text-sm text-[#13201b]"
            value={sql}
            onChange={(event) => setSql(event.target.value)}
          />
          <button
            type="button"
            className="focus-ring mt-3 rounded-md bg-[#13201b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
            onClick={() => void executeQuery()}
          >
            {loading ? 'Running query...' : 'Run query'}
          </button>
          {error ? <p className="mt-3 rounded-md bg-[#fff0eb] p-3 text-sm text-[#a33820]">{error}</p> : null}
        </div>
      </section>

      <section className="control-surface rounded-md p-4">
        <h2 className="text-xl font-semibold">Result set</h2>
        {rows.length === 0 ? (
          <p className="mt-3 rounded-md bg-[#eef4f0] p-3 text-sm text-[#405449]">Run a query to inspect generated operations data.</p>
        ) : (
          <div className="mt-4 overflow-auto rounded-md border border-[#13201b]/10">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead className="bg-[#eef4f0]">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#66756b]">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t border-[#13201b]/10">
                    {columns.map((column) => (
                      <td key={column} className="px-3 py-3 text-[#405449]">
                        {String(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}
