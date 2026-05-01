import { z } from 'zod'

export const bookAppointmentSchema = z.object({
  eventId:       z.string().min(1),
  bookingReason: z.string().min(10, 'Describe el motivo (mínimo 10 caracteres)').max(500),
})

export type BookAppointmentValues = z.infer<typeof bookAppointmentSchema>
