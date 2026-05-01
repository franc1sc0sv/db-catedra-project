import { injectable } from 'inversify'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { Users } from '@project/db/src/schema/iam.schema'
import { UserRole } from '@project/enums/src/user-role.enum'
import { AccountStatus } from '@project/enums/src/account-status.enum'
import {
  IUsersRepository,
  type DoctorRef,
  type ListUsersFilter,
  type PaginatedUsers,
} from '../../domain/interfaces/users.repository'
import type { IUser } from '../../domain/entities/user.entity'

type UserRow = typeof Users.$inferSelect

function toUser(row: UserRow): IUser {
  return {
    id:            row.id,
    email:         row.email,
    name:          row.name,
    role:          row.role as unknown as UserRole,
    accountStatus: row.accountStatus as unknown as AccountStatus,
    createdAt:     row.createdAt,
  }
}

@injectable()
export class DrizzleUsersRepository extends IUsersRepository {
  findById = async (id: string, tx: TxClient): Promise<IUser | null> => {
    const row = await tx.query.Users.findFirst({ where: eq(Users.id, id) })
    return row ? toUser(row) : null
  }

  findByEmail = async (email: string, tx: TxClient): Promise<IUser | null> => {
    const row = await tx.query.Users.findFirst({ where: eq(Users.email, email) })
    return row ? toUser(row) : null
  }

  list = async (filter: ListUsersFilter, tx: TxClient): Promise<PaginatedUsers> => {
    const where = filter.role ? eq(Users.role, filter.role) : undefined
    const offset = (filter.page - 1) * filter.pageSize
    const [rows, totalRows] = await Promise.all([
      tx.select()
        .from(Users)
        .where(where)
        .orderBy(desc(Users.createdAt))
        .limit(filter.pageSize)
        .offset(offset),
      tx.select({ count: sql<number>`count(*)::int` })
        .from(Users)
        .where(where),
    ])
    return {
      items: rows.map(toUser),
      total: Number(totalRows[0]?.count ?? 0),
    }
  }

  listActiveDoctors = async (tx: TxClient): Promise<DoctorRef[]> => {
    const rows = await tx
      .select({ id: Users.id, name: Users.name })
      .from(Users)
      .where(and(eq(Users.role, 'doctor'), eq(Users.accountStatus, 'active')))
      .orderBy(asc(Users.name))
    return rows.map((row) => ({ id: row.id, name: row.name }))
  }

  updateRole = async (id: string, role: UserRole, tx: TxClient): Promise<IUser> => {
    const [row] = await tx.update(Users)
      .set({ role, updatedAt: new Date() })
      .where(eq(Users.id, id))
      .returning()
    if (!row) throw new Error('User not found')
    return toUser(row)
  }

  updateName = async (id: string, name: string, tx: TxClient): Promise<IUser> => {
    const [row] = await tx.update(Users)
      .set({ name, updatedAt: new Date() })
      .where(eq(Users.id, id))
      .returning()
    if (!row) throw new Error('User not found')
    return toUser(row)
  }

  deactivate = async (id: string, tx: TxClient): Promise<void> => {
    await tx.update(Users)
      .set({ accountStatus: 'inactive', updatedAt: new Date() })
      .where(eq(Users.id, id))
  }
}
