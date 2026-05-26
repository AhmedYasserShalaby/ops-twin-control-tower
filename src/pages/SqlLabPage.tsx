import { PageShell } from '../app/AppShell'
import { useState } from 'react'
import { presetQueries } from '../engine/sqlPresets'
import { useOpsTwinStore } from '../store/useOpsTwinStore'
import { Play, Loader2, Copy, Check, Database } from 'lucide-react'

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
        <div className="control-surface rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold">Preset queries</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)] mb-4 font-sans">DuckDB-Wasm runs entirely in your browser. No backend needed.</p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {presetQueries.map((q) => (
                <button key={q.label} type="button"
                  className="focus-ring interactive-card w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2.5 text-left text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                  onClick={() => { setSql(q.sql); void executeQuery(q.sql) }}
                >{q.label}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Database size={16} className="text-[var(--accent-teal)]" />
              Schema Explorer
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)] mb-3">Tables loaded in the active memory workspace.</p>
            <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
              <details className="group border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)]" open>
                <summary className="cursor-pointer p-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg flex justify-between items-center select-none">
                  <span>📊 weekly_metrics</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">26 rows</span>
                </summary>
                <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-secondary)] space-y-1">
                  <div>week: <span className="text-[var(--accent-blue)]">integer</span></div>
                  <div>serviceLevel: <span className="text-[var(--accent-blue)]">double</span></div>
                  <div>profit: <span className="text-[var(--accent-blue)]">double</span></div>
                  <div>revenue: <span className="text-[var(--accent-blue)]">double</span></div>
                  <div>cashBalance: <span className="text-[var(--accent-blue)]">double</span></div>
                  <div>inventoryUnits: <span className="text-[var(--accent-blue)]">integer</span></div>
                  <div>stockoutIncidents: <span className="text-[var(--accent-blue)]">integer</span></div>
                  <div>riskScore: <span className="text-[var(--accent-blue)]">double</span></div>
                  <div>carbonIndex: <span className="text-[var(--accent-blue)]">double</span></div>
                </div>
              </details>

              <details className="group border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)]">
                <summary className="cursor-pointer p-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg flex justify-between items-center select-none">
                  <span>💥 scenario_events</span>
                </summary>
                <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-secondary)] space-y-1">
                  <div>week: <span className="text-[var(--accent-blue)]">integer</span></div>
                  <div>name: <span className="text-[var(--accent-amber)]">varchar</span></div>
                  <div>type: <span className="text-[var(--accent-amber)]">varchar</span></div>
                  <div>severity: <span className="text-[var(--accent-blue)]">double</span></div>
                  <div>durationWeeks: <span className="text-[var(--accent-blue)]">integer</span></div>
                </div>
              </details>

              <details className="group border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)]">
                <summary className="cursor-pointer p-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg flex justify-between items-center select-none">
                  <span>🛠️ decisions</span>
                </summary>
                <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-secondary)] space-y-1">
                  <div>week: <span className="text-[var(--accent-blue)]">integer</span></div>
                  <div>name: <span className="text-[var(--accent-amber)]">varchar</span></div>
                  <div>type: <span className="text-[var(--accent-amber)]">varchar</span></div>
                  <div>intensity: <span className="text-[var(--accent-blue)]">double</span></div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="control-surface rounded-xl p-5 flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]" htmlFor="sql-editor">SQL editor</label>
            <textarea id="sql-editor"
              className="focus-ring mt-2 min-h-44 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3 font-mono text-sm text-[var(--accent-teal)] placeholder:text-[var(--text-muted)]"
              value={sql} onChange={(e) => setSql(e.target.value)} placeholder="SELECT * FROM weekly_metrics LIMIT 10"
            />
          </div>
          <div>
            <button type="button" aria-label="Run SQL query" className="btn-primary mt-3 cursor-pointer" disabled={loading} onClick={() => void executeQuery()}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Running...</> : <><Play size={16} />Run query</>}
            </button>
            {error && <p className="mt-3 rounded-lg bg-[var(--accent-red-dim)] p-3 text-sm text-[var(--accent-red)]">{error}</p>}
          </div>
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
