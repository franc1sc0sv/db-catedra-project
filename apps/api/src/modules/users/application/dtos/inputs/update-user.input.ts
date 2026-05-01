import { t, type Static } from 'elysia'
import { UserRole } from '@project/enums/src/user-role.enum'

export const UpdateUserInputSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  role: t.Optional(t.Enum(UserRole)),
})

export type UpdateUserInput = Static<typeof UpdateUserInputSchema>
