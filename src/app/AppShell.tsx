import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  Activity,
  ClipboardList,
  Database,
  FileText,
  GitBranch,
  Home,
  Menu,
  Network,
  Radar,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Overview', icon: Home, hint: 'KPIs and recommendation' },
  { to: '/scenario', label: 'Scenario', icon: Radar, hint: 'Events and responses' },
  { to: '/network', label: 'Network', icon: Network, hint: 'Suppliers and lanes' },
  { to: '/analytics', label: 'Analytics', icon: Activity, hint: 'Trends and Monte Carlo' },
  { to: '/sql', label: 'SQL Lab', icon: Database, hint: 'Query generated data' },
  { to: '/postmortem', label: 'Postmortem', icon: ClipboardList, hint: 'Incident summary' },
  { to: '/about', label: 'Case Study', icon: FileText, hint: 'Project notes' },
] as const

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="focus-ring flex items-center gap-3 rounded-md">
            <span className="grid size-10 place-items-center rounded-md border border-[var(--text-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
              <GitBranch size={19} aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-[0.7rem] uppercase text-[var(--text-muted)]">OpsTwin</strong>
              <span className="text-base font-bold">Operations Control</span>
            </span>
          </Link>

          <span className="hidden rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-bold text-[var(--text-muted)] sm:inline-flex">
            Static simulation
          </span>

          <nav className="hidden gap-1 lg:flex" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                    active
                      ? 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            className="focus-ring rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen ? (
          <nav className="animate-fade-in border-t border-[var(--border-subtle)] px-4 py-3 lg:hidden" aria-label="Mobile navigation">
            <div className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                      active
                        ? 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs font-semibold text-[var(--text-muted)]">{item.hint}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-xs font-semibold text-[var(--text-muted)]">
          Synthetic data. Static app. No backend, accounts, secrets, or real company data.
        </div>
      </footer>
    </div>
  )
}

export function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="animate-fade-in-up">
        <p className="text-xs font-extrabold uppercase text-[var(--text-muted)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">{title}</h1>
      </div>
      {children}
    </section>
  )
}
