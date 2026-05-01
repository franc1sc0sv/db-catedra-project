import type { UserRole } from '@project/enums/src/user-role.enum'
import type { AccountStatus } from '@project/enums/src/account-status.enum'

export interface IUser {
  id: string
  email: string
  name: string
  role: UserRole
  accountStatus: AccountStatus
  createdAt: Date
}
