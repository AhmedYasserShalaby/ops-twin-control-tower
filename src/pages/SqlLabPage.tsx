import { PageShell } from '../app/AppShell'
import { useState } from 'react'
import { presetQueries } from '../engine/sqlPresets'
import { useOpsTwinStore } from '../store/useOpsTwinStore'
import { Play, Loader2, Copy, Check } from 'lucide-react'

export function SqlLabPage() {
  const run = useOpsTwinStore((s) => s.run)
  const [sql, setSql] = useState(presetQueries[0].sql)
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function executeQuery(nextSql = sql) {
    setLoading(true); setError('')
    try {
      const { querySimulation } = await import('../engine/duckdb')
      setRows(await querySimulation(run, nextSql))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed'); setRows([])
    } finally { setLoading(false) }
  }

  function copyResults() {
    const text = rows.map(r => Object.values(r).join('\t')).join('\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const columns = rows[0] ? Object.keys(rows[0]) : []

  return (
    <PageShell eyebrow="Browser SQL" title="In-browser DuckDB lab">
      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="control-surface rounded-xl p-5">
          <h2 className="text-lg font-bold">Preset queries</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">DuckDB-Wasm runs entirely in your browser. No backend needed.</p>
          <div className="mt-4 space-y-2">
            {presetQueries.map((q) => (
              <button key={q.label} type="button"
                className="focus-ring interactive-card w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-left text-sm font-semibold text-[var(--text-primary)]"
                onClick={() => { setSql(q.sql); void executeQuery(q.sql) }}
              >{q.label}</button>
            ))}
          </div>
        </div>

        <div className="control-surface rounded-xl p-5">
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]" htmlFor="sql-editor">SQL editor</label>
          <textarea id="sql-editor"
            className="focus-ring mt-2 min-h-36 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3 font-mono text-sm text-[var(--accent-teal)] placeholder:text-[var(--text-muted)]"
            value={sql} onChange={(e) => setSql(e.target.value)} placeholder="SELECT * FROM weekly_metrics LIMIT 10"
          />
          <button type="button" aria-label="Run SQL query" className="btn-primary mt-3" disabled={loading} onClick={() => void executeQuery()}>
            {loading ? <><Loader2 size={16} className="animate-spin" />Running...</> : <><Play size={16} />Run query</>}
          </button>
          {error && <p className="mt-3 rounded-lg bg-[var(--accent-red-dim)] p-3 text-sm text-[var(--accent-red)]">{error}</p>}
        </div>
      </section>

      <section className="control-surface rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Result set</h2>
          {rows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="badge badge-teal">{rows.length} rows</span>
              <button type="button" className="btn-secondary text-xs" onClick={copyResults}>
                {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
              </button>
            </div>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="rounded-lg bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-muted)]">Run a query to inspect generated operations data.</p>
        ) : (
          <div className="overflow-auto rounded-lg border border-[var(--border-subtle)] max-h-[400px]">
            <table className="data-table">
              <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={i}>{columns.map(c => <td key={c}>{String(r[c])}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}
