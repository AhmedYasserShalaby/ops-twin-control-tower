import { PageShell } from '../app/AppShell'
import { generatePostmortem } from '../engine/postmortem'
import { useOpsTwinStore } from '../store/useOpsTwinStore'
import { Copy, Check, AlertCircle, Shield, Target, ListChecks } from 'lucide-react'
import { useState } from 'react'

export function PostmortemPage() {
  const run = useOpsTwinStore((s) => s.run)
  const report = generatePostmortem(run)
  const [copied, setCopied] = useState(false)

  function shareReport() {
    const md = `# ${report.title}\n\n${report.executiveSummary}\n\n## Root Cause\n${report.rootCause}\n\n## Impact\n${report.impact}\n\n## Decisions\n${report.decisions.map(d => `- ${d}`).join('\n')}\n\n## Prevention\n${report.prevention.map(p => `- ${p}`).join('\n')}`
    navigator.clipboard.writeText(md).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <PageShell eyebrow="Incident Narrative" title="Recovery postmortem">
      <article className="control-surface rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Auto-generated report</p>
            <h2 className="mt-2 text-2xl font-bold">{report.title}</h2>
          </div>
          <button type="button" className="btn-secondary shrink-0" onClick={shareReport}>
            {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Share as Markdown</>}
          </button>
        </div>
        <p className="mt-4 rounded-xl bg-[var(--bg-elevated)] p-4 text-[var(--text-secondary)] leading-relaxed">{report.executiveSummary}</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Section icon={<AlertCircle size={16} className="text-[var(--accent-red)]" />} title="Root cause" body={report.rootCause} />
          <Section icon={<Target size={16} className="text-[var(--accent-amber)]" />} title="KPI impact" body={report.impact} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <List icon={<ListChecks size={16} className="text-[var(--accent-teal)]" />} title="Decisions taken" items={report.decisions} />
          <List icon={<Shield size={16} className="text-[var(--accent-blue)]" />} title="Prevention backlog" items={report.prevention} />
        </div>
      </article>
    </PageShell>
  )
}

function Section({ icon, body, title }: { icon: React.ReactNode; body: string; title: string }) {
  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
      <div className="flex items-center gap-2"><span>{icon}</span><h3 className="text-base font-bold">{title}</h3></div>
      <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{body}</p>
    </section>
  )
}

function List({ icon, items, title }: { icon: React.ReactNode; items: string[]; title: string }) {
  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
      <div className="flex items-center gap-2"><span>{icon}</span><h3 className="text-base font-bold">{title}</h3></div>
      <ul className="mt-3 space-y-2">{items.map(item => (
        <li key={item} className="rounded-lg bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-secondary)]">{item}</li>
      ))}</ul>
    </section>
  )
}
