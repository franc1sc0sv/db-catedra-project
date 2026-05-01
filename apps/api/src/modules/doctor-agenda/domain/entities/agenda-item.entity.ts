export type AgendaStatus = 'disponible' | 'reservado' | 'completado' | 'cancelado'

export interface IAgendaItem {
  slotId:         string
  startTime:      string
  endTime:        string
  patientId?:     string | null
  patientName?:   string | null
  bookingReason?: string | null
  status:         AgendaStatus
  mainDiagnosis?: string | null
}
