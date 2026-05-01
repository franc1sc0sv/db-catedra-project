import type { TxClient } from '@project/db/src/client'
import type { UserRole } from '@project/enums/src/user-role.enum'
import type { IUser } from '../entities/user.entity'

export interface ListUsersFilter {
  role?:    UserRole
  page:     number
  pageSize: number
}

export interface PaginatedUsers {
  items: IUser[]
  total: number
}

export interface DoctorRef {
  id:   string
  name: string
}

export abstract class IUsersRepository {
  abstract findById(id: string, tx: TxClient): Promise<IUser | null>
  abstract findByEmail(email: string, tx: TxClient): Promise<IUser | null>
  abstract list(filter: ListUsersFilter, tx: TxClient): Promise<PaginatedUsers>
  abstract listActiveDoctors(tx: TxClient): Promise<DoctorRef[]>
  abstract updateRole(id: string, role: UserRole, tx: TxClient): Promise<IUser>
  abstract updateName(id: string, name: string, tx: TxClient): Promise<IUser>
  abstract deactivate(id: string, tx: TxClient): Promise<void>
}
