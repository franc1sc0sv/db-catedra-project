import { requireRole } from '@/shared/auth/guards.server'
import { UserRole } from '@project/enums/src/user-role.enum'

export default async function AgendaLayout({ children }: { children: React.ReactNode }) {
  await requireRole([UserRole.Receptionist, UserRole.Doctor])
  return <>{children}</>
}
