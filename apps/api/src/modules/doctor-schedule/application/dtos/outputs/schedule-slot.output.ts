import { t, type Static } from 'elysia'

export const ScheduleSlotOutputSchema = t.Object({
  eventDate: t.String(),
  startTime: t.String(),
  endTime:   t.String(),
})

export type ScheduleSlotOutput = Static<typeof ScheduleSlotOutputSchema>
