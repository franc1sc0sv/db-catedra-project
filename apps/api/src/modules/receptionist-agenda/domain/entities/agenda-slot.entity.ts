export interface IAgendaSlot {
  slotId:             string
  eventDate:          string
  startTime:          string
  endTime:            string
  availabilityStatus: string
  patientName:        string | null
  bookingReason:      string | null
  whatsappPhone:      string | null
  appointmentId:      string | null
}
