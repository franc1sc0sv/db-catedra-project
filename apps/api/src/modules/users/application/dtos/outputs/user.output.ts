import { t, type Static } from 'elysia'
import { UserRole } from '@project/enums/src/user-role.enum'
import { AccountStatus } from '@project/enums/src/account-status.enum'

export const UserOutputSchema = t.Object({
  id:            t.String(),
  email:         t.String(),
  name:          t.String(),
  role:          t.Enum(UserRole),
  accountStatus: t.Enum(AccountStatus),
  createdAt:     t.Date(),
})

export type UserOutput = Static<typeof UserOutputSchema>

export const UsersListOutputSchema = t.Object({
  items: t.Array(UserOutputSchema),
  total: t.Number(),
  page:  t.Number(),
  pageSize: t.Number(),
})

export type UsersListOutput = Static<typeof UsersListOutputSchema>

export const DoctorRefOutputSchema = t.Object({
  id:   t.String(),
  name: t.String(),
})

export const DoctorRefListOutputSchema = t.Array(DoctorRefOutputSchema)

export type DoctorRefOutput = Static<typeof DoctorRefOutputSchema>
