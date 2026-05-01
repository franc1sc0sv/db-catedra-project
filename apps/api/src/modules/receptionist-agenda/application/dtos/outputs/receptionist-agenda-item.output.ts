import { t, type Static } from 'elysia'

export const ReceptionistAgendaItemOutputSchema = t.Object({
  slotId:             t.String(),
  startTime:          t.String(),
  endTime:            t.String(),
  availabilityStatus: t.String(),
  patientName:        t.Union([t.String(), t.Null()]),
  bookingReason:      t.Union([t.String(), t.Null()]),
  whatsappPhone:      t.Union([t.String(), t.Null()]),
  appointmentId:      t.Union([t.String(), t.Null()]),
})

export const ReceptionistAgendaListOutputSchema = t.Array(ReceptionistAgendaItemOutputSchema)

export type ReceptionistAgendaItemOutput = Static<typeof ReceptionistAgendaItemOutputSchema>
