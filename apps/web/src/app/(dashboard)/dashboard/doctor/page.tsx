import { requireAuth } from '@/shared/auth/guards.server'
import { DoctorDashboardPage } from '@/views/dashboard-doctor'
import { toUser } from '@/entities/user'

export default async function DoctorRoute() {
  const session = await requireAuth()
  return <DoctorDashboardPage user={toUser(session.user)} />
}
