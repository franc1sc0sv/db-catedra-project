import { t, type Static } from 'elysia'

export const PatientOutputSchema = t.Object({
  dui:           t.String(),
  userId:        t.Nullable(t.String()),
  firstName:     t.String(),
  lastName:      t.String(),
  whatsappPhone: t.String(),
  birthDate:     t.String(),
  insuranceId:   t.Nullable(t.String()),
})

export type PatientOutput = Static<typeof PatientOutputSchema>
