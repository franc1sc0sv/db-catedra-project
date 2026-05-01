import { DashboardNavWidget } from '@/widgets/dashboard-nav'
import type { User } from '@/entities/user'

interface AppShellWidgetProps {
  user: User
  children: React.ReactNode
}

export function AppShellWidget({ user, children }: AppShellWidgetProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardNavWidget user={user} />
      <main className="flex min-w-0 flex-1 overflow-auto px-6 py-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
