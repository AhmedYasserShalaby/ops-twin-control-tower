import type { ReactNode } from 'react'
import { Briefcase, Code2, Cpu } from 'lucide-react'
import { PageShell } from '../app/AppShell'

export function AboutPage() {
  return (
    <PageShell eyebrow="Recruiter brief" title="OpsTwin case study">
      <section className="dark-surface rounded-lg p-6 sm:p-8">
        <span className="badge badge-teal mb-3">Portfolio project</span>
        <h2 className="mt-2 max-w-4xl text-3xl font-bold leading-tight lg:text-4xl">
          A static decision tool for supply chain disruption.
        </h2>
        <p className="mt-4 max-w-3xl text-[var(--text-secondary)]">
          OpsTwin shows how a business system changes when suppliers, warehouses, logistics, demand, cash, or data
          quality break down.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3 stagger-children">
        <Card
          icon={<Cpu size={20} className="text-[var(--accent-teal)]" />}
          title="Model"
          body="Suppliers, warehouses, products, regions, lanes, cash, inventory, service level, and risk."
        />
        <Card
          icon={<Code2 size={20} className="text-[var(--accent-blue)]" />}
          title="Stack"
          body="React, TypeScript, Vite, Tailwind, Zustand, React Flow, D3, DuckDB-Wasm, Vitest, and Playwright."
        />
        <Card
          icon={<Briefcase size={20} className="text-[var(--accent-amber)]" />}
          title="Signal"
          body="Data thinking, business tradeoffs, frontend product judgment, testing, and static deployment."
        />
      </section>

      <section className="control-surface rounded-lg p-6">
        <h2 className="text-xl font-bold">Interview explanation</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
          I built OpsTwin as a static React app that simulates operations during disruption. Users add scenarios, apply
          decisions, compare outcomes, inspect a supplier network, query generated KPI data in the browser, and produce
          a short postmortem. The data is synthetic, so the project is safe to publish and easy to inspect.
        </p>
      </section>
    </PageShell>
  )
}

function Card({ icon, body, title }: { icon: ReactNode; body: string; title: string }) {
  return (
    <article className="control-surface interactive-card rounded-lg p-5">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <p className="text-sm text-[var(--text-muted)]">{body}</p>
    </article>
  )
}
