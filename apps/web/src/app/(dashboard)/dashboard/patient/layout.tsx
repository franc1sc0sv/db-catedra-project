import { requireRole } from '@/shared/auth/guards.server'
import { UserRole } from '@project/enums/src/user-role.enum'

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  await requireRole([UserRole.Patient])
  return <>{children}</>
}
