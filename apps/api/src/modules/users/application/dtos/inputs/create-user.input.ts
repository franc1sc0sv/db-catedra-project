import { t, type Static } from 'elysia'
import { UserRole } from '@project/enums/src/user-role.enum'

export const CreateUserInputSchema = t.Object({
  email:    t.String({ format: 'email' }),
  name:     t.String({ minLength: 1, maxLength: 255 }),
  password: t.String({ minLength: 8 }),
  role:     t.Enum(UserRole),
})

export type CreateUserInput = Static<typeof CreateUserInputSchema>
