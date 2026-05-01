import { t, type Static } from 'elysia'

export const UpcomingAppointmentDtoSchema = t.Object({
  id:            t.String(),
  eventDate:     t.String(),
  startTime:     t.String(),
  endTime:       t.String(),
  bookingReason: t.String(),
  status:        t.String(),
})

export const PastAppointmentDtoSchema = t.Object({
  id:                  t.String(),
  eventDate:           t.String(),
  startTime:           t.String(),
  endTime:             t.String(),
  bookingReason:       t.String(),
  status:              t.String(),
  mainDiagnosis:       t.Nullable(t.String()),
  prescribedTreatment: t.Nullable(t.String()),
})

export const MyAppointmentsOutputSchema = t.Object({
  upcoming: t.Array(UpcomingAppointmentDtoSchema),
  past:     t.Array(PastAppointmentDtoSchema),
  total:    t.Number(),
  page:     t.Number(),
  pageSize: t.Number(),
})

export type UpcomingAppointmentDto = Static<typeof UpcomingAppointmentDtoSchema>
export type PastAppointmentDto     = Static<typeof PastAppointmentDtoSchema>
export type MyAppointmentsOutput   = Static<typeof MyAppointmentsOutputSchema>
