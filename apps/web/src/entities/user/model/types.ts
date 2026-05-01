import { UserRole } from '@project/enums/src/user-role.enum'
import { AccountStatus } from '@project/enums/src/account-status.enum'
import type { SessionUser } from '@project/auth/src/auth'

export interface User {
  id: string
  email: string
  role: UserRole
  accountStatus: AccountStatus
  createdAt: Date
}

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  [UserRole.Doctor]:       '/dashboard/doctor',
  [UserRole.Patient]:      '/dashboard/patient',
  [UserRole.Receptionist]: '/dashboard/receptionist',
}

export function toUser(sessionUser: SessionUser): User {
  return {
    id:            sessionUser.id,
    email:         sessionUser.email,
    role:          sessionUser.role as UserRole,
    accountStatus: sessionUser.accountStatus as AccountStatus,
    createdAt:     sessionUser.createdAt,
  }
}
