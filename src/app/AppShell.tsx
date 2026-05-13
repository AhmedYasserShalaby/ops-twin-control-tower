import type { ReactNode } from 'react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  Activity,
  ClipboardList,
  Database,
  FileText,
  GitBranch,
  Home,
  Network,
  Radar,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useOpsTwinStore } from '../store/useOpsTwinStore'

const navItems = [
  { to: '/', label: 'Command', icon: Home, hint: 'Overview dashboard' },
  { to: '/scenario', label: 'Scenario', icon: Radar, hint: 'Build disruption scenarios' },
  { to: '/network', label: 'Network', icon: Network, hint: 'Supply chain graph' },
  { to: '/analytics', label: 'Analytics', icon: Activity, hint: 'KPI trends & Monte Carlo' },
  { to: '/sql', label: 'SQL Lab', icon: Database, hint: 'Query with DuckDB' },
  { to: '/postmortem', label: 'Postmortem', icon: ClipboardList, hint: 'Recovery report' },
  { to: '/about', label: 'Case Study', icon: FileText, hint: 'About this project' },
] as const

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [mobileOpen, setMobileOpen] = useState(false)
  const run = useOpsTwinStore((state) => state.run)
  const healthColor = run.summary.serviceLevel >= 92 ? 'var(--accent-teal)' : run.summary.serviceLevel >= 80 ? 'var(--accent-amber)' : 'var(--accent-red)'

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="focus-ring flex items-center gap-3 rounded-lg">
            <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent-teal)] to-[#00b880] text-[var(--bg-base)]">
              <GitBranch size={20} aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">OpsTwin</strong>
              <span className="text-base font-semibold">Control Tower</span>
            </span>
          </Link>

          {/* Health indicator */}
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="inline-block size-2.5 rounded-full animate-live-pulse"
              style={{ background: healthColor }}
            />
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {run.summary.serviceLevel >= 92 ? 'Healthy' : run.summary.serviceLevel >= 80 ? 'Stressed' : 'Critical'}
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden gap-1 lg:flex" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`focus-ring group relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-3 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[var(--accent-teal)]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="focus-ring rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="animate-fade-in border-t border-[var(--border-subtle)] px-4 py-3 lg:hidden" aria-label="Mobile navigation">
            <div className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-[var(--text-muted)]">{item.hint}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-xs text-[var(--text-muted)]">
          Synthetic data only · No backend, secrets, or real company data · Built as a portfolio project
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">{title}</h1>
      </div>
      {children}
    </section>
  )
}
