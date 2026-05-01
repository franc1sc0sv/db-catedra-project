import { redirect } from 'next/navigation'
import { requireAuth, isUserRole } from '@/shared/auth/guards.server'
import { ROLE_DASHBOARD } from '@/entities/user'

export default async function DashboardPage() {
  const session = await requireAuth()
  const role = session.user.role

  if (isUserRole(role)) redirect(ROLE_DASHBOARD[role])

  return (
    <div className="space-y-4 text-sm">
      <h1>Unknown role</h1>
      <p className="text-muted-foreground">
        Your session has no recognized role. Sign out and sign in again.
      </p>
      <pre className="bg-muted text-foreground p-3 rounded-md text-xs overflow-auto border border-border">
{JSON.stringify(session.user, null, 2)}
      </pre>
    </div>
  )
}
