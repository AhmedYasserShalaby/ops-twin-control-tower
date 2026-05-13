import { PageShell } from '../app/AppShell'
import { Cpu, Code2, Briefcase } from 'lucide-react'

export function AboutPage() {
  return (
    <PageShell eyebrow="Recruiter Brief" title="OpsTwin case study">
      <section className="dark-surface rounded-2xl p-6 sm:p-8">
        <span className="badge badge-teal mb-3">Portfolio project</span>
        <h2 className="mt-2 max-w-4xl text-3xl font-bold leading-tight lg:text-4xl">
          A Business Informatics proof piece that behaves like a decision product.
        </h2>
        <p className="mt-4 max-w-3xl text-[var(--text-secondary)]">
          OpsTwin was built to stand apart from normal student dashboards. It combines business process modeling,
          operational risk, simulation, decision support, browser analytics, and product UI in one recruiter-ready app.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3 stagger-children">
        <Card icon={<Cpu size={20} className="text-[var(--accent-teal)]" />} title="System modeled"
          body="Suppliers, warehouses, products, customer regions, transport lanes, cash, inventory, service levels, and risk." />
        <Card icon={<Code2 size={20} className="text-[var(--accent-blue)]" />} title="Technical proof"
          body="React 19, TypeScript, Vite 8, Tailwind 4, Zustand, React Flow, D3, DuckDB-Wasm, Vitest, and Playwright." />
        <Card icon={<Briefcase size={20} className="text-[var(--accent-amber)]" />} title="Internship signal"
          body="Shows data engineering thinking, business tradeoff judgment, UI/UX skill, and automation discipline." />
      </section>

      <section className="control-surface rounded-xl p-6">
        <h2 className="text-xl font-bold">How to explain it in interviews</h2>
        <p className="mt-3 text-[var(--text-secondary)] leading-relaxed italic">
          "I built OpsTwin as a static web app that simulates enterprise operations during disruption. The app lets users
          add scenarios, apply response decisions, run Monte Carlo comparisons in a web worker, inspect a supplier network,
          query generated KPI tables using DuckDB-Wasm, and generate a postmortem. It is synthetic, safe to publish, and
          designed to show decision systems thinking beyond standard dashboards."
        </p>
      </section>
    </PageShell>
  )
}

function Card({ icon, body, title }: { icon: React.ReactNode; body: string; title: string }) {
  return (
    <article className="control-surface interactive-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">{icon}<h2 className="text-lg font-bold">{title}</h2></div>
      <p className="text-sm text-[var(--text-muted)]">{body}</p>
    </article>
  )
}
