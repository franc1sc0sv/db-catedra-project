import { t, type Static } from 'elysia'

export const BookAppointmentInputSchema = t.Object({
  eventId:       t.String(),
  bookingReason: t.String({ minLength: 1, maxLength: 500 }),
})

export type BookAppointmentInput = Static<typeof BookAppointmentInputSchema>
