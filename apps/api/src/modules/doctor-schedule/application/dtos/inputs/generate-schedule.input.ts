import { t, type Static } from 'elysia'

export const GenerateScheduleInputSchema = t.Object({
  selectedDays:  t.Array(t.Integer({ minimum: 0, maximum: 6 }), { minItems: 1 }),
  startTime:     t.String({ pattern: '^\\d{2}:\\d{2}$' }),
  endTime:       t.String({ pattern: '^\\d{2}:\\d{2}$' }),
  slotDuration:  t.Union([t.Literal(15), t.Literal(30), t.Literal(45), t.Literal(60)]),
  weekStartDate: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
})

export type GenerateScheduleInput = Static<typeof GenerateScheduleInputSchema>
