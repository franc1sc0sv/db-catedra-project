import { t, type Static } from 'elysia'

export const HealthOutputSchema = t.Object({
  status:    t.String(),
  database:  t.String(),
  uptime:    t.Number(),
  timestamp: t.String(),
})

export type HealthOutput = Static<typeof HealthOutputSchema>
