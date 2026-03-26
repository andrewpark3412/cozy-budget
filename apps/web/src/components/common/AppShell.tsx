import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PiggyBank,
  CreditCard,
  BarChart2,
  RefreshCw,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/budget', label: 'Budget', icon: LayoutDashboard },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/debt', label: 'Debt', icon: CreditCard },
  { to: '/reports', label: 'Reports', icon: BarChart2 },
  { to: '/recurring', label: 'Recurring', icon: RefreshCw },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const AppShell = () => {
  return (
    <div className="flex h-screen flex-col bg-background md:flex-row">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="border-b border-border px-6 py-5">
          <h1 className="text-lg font-semibold text-primary">Cozy Budget</h1>
        </div>
        <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0" id="main-content">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface safe-bottom md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default AppShell
