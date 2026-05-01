import { t, type Static } from 'elysia'

export const AvailableSlotOutputSchema = t.Object({
  id:        t.String(),
  doctorId:  t.String(),
  eventDate: t.String(),
  startTime: t.String(),
  endTime:   t.String(),
})

export type AvailableSlotOutput = Static<typeof AvailableSlotOutputSchema>
