import { t, type Static } from 'elysia'

export const ScheduleEventOutputSchema = t.Object({
  id:                 t.String(),
  doctorId:           t.String(),
  eventDate:          t.String(),
  startTime:          t.String(),
  endTime:            t.String(),
  eventType:          t.String(),
  availabilityStatus: t.String(),
})

export const ScheduleEventListOutputSchema = t.Array(ScheduleEventOutputSchema)

export type ScheduleEventOutput = Static<typeof ScheduleEventOutputSchema>
