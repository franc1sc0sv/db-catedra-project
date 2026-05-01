import { t, type Static } from 'elysia'

export const InsuranceOutputSchema = t.Object({
  id:           t.String(),
  insurerName:  t.String(),
  coverageType: t.String(),
})

export type InsuranceOutput = Static<typeof InsuranceOutputSchema>
