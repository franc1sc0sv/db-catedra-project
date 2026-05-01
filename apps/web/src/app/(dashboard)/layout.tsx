import { requireAuth } from '@/shared/auth/guards.server'
import { AppShellWidget } from '@/widgets/app-shell'
import { toUser } from '@/entities/user'

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  return <AppShellWidget user={toUser(session.user)}>{children}</AppShellWidget>
}
