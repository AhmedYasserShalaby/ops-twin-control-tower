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
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Command', icon: Home },
  { to: '/scenario', label: 'Scenario', icon: Radar },
  { to: '/network', label: 'Network', icon: Network },
  { to: '/analytics', label: 'Analytics', icon: Activity },
  { to: '/sql', label: 'SQL Lab', icon: Database },
  { to: '/postmortem', label: 'Postmortem', icon: ClipboardList },
  { to: '/about', label: 'Case Study', icon: FileText },
] as const

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className="min-h-screen bg-[#f5f7f2] text-[#13201b]">
      <header className="sticky top-0 z-20 border-b border-[#13201b]/10 bg-[#f5f7f2]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/" className="focus-ring flex items-center gap-3 rounded-md">
            <span className="grid size-11 place-items-center rounded-md bg-[#13201b] text-white">
              <GitBranch size={22} aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-sm uppercase tracking-[0.2em] text-[#5c6f64]">OpsTwin</strong>
              <span className="text-lg font-semibold">Control Tower</span>
            </span>
          </Link>

          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    active
                      ? 'focus-ring inline-flex items-center gap-2 rounded-md bg-[#13201b] px-3 py-2 text-sm font-semibold text-white'
                      : 'focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#405449] hover:bg-white'
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
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
    <section className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#66756b]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#13201b] sm:text-4xl">{title}</h1>
      </div>
      {children}
    </section>
  )
}
