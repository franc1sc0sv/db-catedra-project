import { t, type Static } from 'elysia'

export const GenerateScheduleOutputSchema = t.Object({
  created: t.Integer(),
  skipped: t.Integer(),
})

export type GenerateScheduleOutput = Static<typeof GenerateScheduleOutputSchema>
