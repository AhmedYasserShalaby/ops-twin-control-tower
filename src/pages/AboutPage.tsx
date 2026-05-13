import { PageShell } from '../app/AppShell'

export function AboutPage() {
  return (
    <PageShell eyebrow="Recruiter Brief" title="OpsTwin case study">
      <section className="dark-surface rounded-md p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9edbc8]">Why this exists</p>
        <h2 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight">
          A Business Informatics proof piece that behaves like a decision product.
        </h2>
        <p className="mt-4 max-w-3xl text-[#dcece5]">
          OpsTwin was built to stand apart from normal student dashboards. It combines business process modeling,
          operational risk, simulation, decision support, browser analytics, and product UI in one recruiter-ready app.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card
          title="System modeled"
          body="Suppliers, warehouses, products, customer regions, transport lanes, cash, inventory, service levels, and risk."
        />
        <Card
          title="Technical proof"
          body="React 19, TypeScript, Vite 8, Tailwind 4, Zustand, React Flow, D3, DuckDB-Wasm, Vitest, and Playwright."
        />
        <Card
          title="Internship signal"
          body="Shows data engineering thinking, business tradeoff judgment, UI/UX skill, and automation discipline."
        />
      </section>

      <section className="control-surface rounded-md p-5">
        <h2 className="text-2xl font-semibold">How to explain it in interviews</h2>
        <p className="mt-3 text-[#405449]">
          “I built OpsTwin as a static web app that simulates enterprise operations during disruption. The app lets users
          add scenarios, apply response decisions, run Monte Carlo comparisons in a web worker, inspect a supplier network,
          query generated KPI tables using DuckDB-Wasm, and generate a postmortem. It is synthetic, safe to publish, and
          designed to show decision systems thinking beyond standard dashboards.”
        </p>
      </section>
    </PageShell>
  )
}

function Card({ body, title }: { body: string; title: string }) {
  return (
    <article className="control-surface rounded-md p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[#5d6b63]">{body}</p>
    </article>
  )
}
