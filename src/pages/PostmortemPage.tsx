import { PageShell } from '../app/AppShell'
import { generatePostmortem } from '../engine/postmortem'
import { useOpsTwinStore } from '../store/useOpsTwinStore'

export function PostmortemPage() {
  const run = useOpsTwinStore((state) => state.run)
  const report = generatePostmortem(run)

  return (
    <PageShell eyebrow="Incident Narrative" title="Generated recovery postmortem">
      <article className="control-surface rounded-md p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#66756b]">Incident report</p>
        <h2 className="mt-2 text-2xl font-semibold">{report.title}</h2>
        <p className="mt-4 rounded-md bg-[#eef4f0] p-4 text-[#405449]">{report.executiveSummary}</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Section title="Root cause" body={report.rootCause} />
          <Section title="KPI impact" body={report.impact} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <List title="Decisions taken" items={report.decisions} />
          <List title="Prevention backlog" items={report.prevention} />
        </div>
      </article>
    </PageShell>
  )
}

function Section({ body, title }: { body: string; title: string }) {
  return (
    <section className="rounded-md border border-[#13201b]/10 bg-white p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#5d6b63]">{body}</p>
    </section>
  )
}

function List({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-md border border-[#13201b]/10 bg-white p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-[#fbfcf8] p-3 text-sm text-[#405449]">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
