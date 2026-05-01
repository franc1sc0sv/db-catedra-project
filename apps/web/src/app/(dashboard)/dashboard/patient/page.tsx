import { requireAuth } from '@/shared/auth/guards.server'
import { PatientDashboardPage } from '@/views/dashboard-patient'
import { toUser } from '@/entities/user'

export default async function PatientRoute() {
  const session = await requireAuth()
  return <PatientDashboardPage user={toUser(session.user)} />
}
