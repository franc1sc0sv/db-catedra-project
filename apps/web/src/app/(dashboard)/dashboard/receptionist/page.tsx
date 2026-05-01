import { requireAuth } from '@/shared/auth/guards.server'
import { ReceptionistDashboardPage } from '@/views/dashboard-receptionist'
import { toUser } from '@/entities/user'

export default async function ReceptionistRoute() {
  const session = await requireAuth()
  return <ReceptionistDashboardPage user={toUser(session.user)} />
}
