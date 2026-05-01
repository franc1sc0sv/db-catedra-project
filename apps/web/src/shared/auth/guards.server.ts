import 'server-only'
import { redirect } from 'next/navigation'
import { getServerSession } from './get-session.server'
import type { Session } from '@project/auth/src/auth'
import { UserRole } from '@project/enums/src/user-role.enum'

const USER_ROLE_VALUES = Object.values(UserRole) as string[]

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLE_VALUES.includes(value)
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession()
  if (!session) redirect('/login')
  return session
}

export async function requireRole(allowed: UserRole[]): Promise<Session> {
  const session = await requireAuth()
  const role = session.user.role
  if (!isUserRole(role) || !allowed.includes(role)) redirect('/dashboard')
  return session
}

export async function requireGuest(): Promise<void> {
  const session = await getServerSession()
  if (session) redirect('/dashboard')
}
