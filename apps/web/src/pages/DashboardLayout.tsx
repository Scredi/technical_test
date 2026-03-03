import { Outlet, NavLink } from 'react-router-dom'
import { Separator } from '@repo/ui'
import { LayoutDashboard, User, FileText } from 'lucide-react'

const nav = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/dashboard/account', label: 'Mon compte', icon: User },
]

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Technical Test
          </h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Separator />
        <div className="p-2">
          <NavLink
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Déconnexion
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
