import { t, type Static } from 'elysia'

export const CompleteProfileInputSchema = t.Object({
  firstName:   t.String({ minLength: 1 }),
  lastName:    t.String({ minLength: 1 }),
  dui:         t.String({ minLength: 9, maxLength: 9 }),
  birthDate:   t.String({ minLength: 1 }),
  whatsapp:    t.String({ minLength: 8 }),
  insuranceId: t.Optional(t.Nullable(t.String())),
})

export type CompleteProfileInput = Static<typeof CompleteProfileInputSchema>
