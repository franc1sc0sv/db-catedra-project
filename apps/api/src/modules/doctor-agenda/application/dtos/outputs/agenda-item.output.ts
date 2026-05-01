import { t, type Static } from 'elysia'

export const AgendaStatusSchema = t.Union([
  t.Literal('disponible'),
  t.Literal('reservado'),
  t.Literal('completado'),
  t.Literal('cancelado'),
])

export const AgendaItemOutputSchema = t.Object({
  slotId:         t.String(),
  startTime:      t.String(),
  endTime:        t.String(),
  patientId:      t.Union([t.String(), t.Null()]),
  patientName:    t.Union([t.String(), t.Null()]),
  bookingReason:  t.Union([t.String(), t.Null()]),
  status:         AgendaStatusSchema,
  mainDiagnosis:  t.Union([t.String(), t.Null()]),
})

export const AgendaListOutputSchema = t.Array(AgendaItemOutputSchema)

export type AgendaItemOutput = Static<typeof AgendaItemOutputSchema>
