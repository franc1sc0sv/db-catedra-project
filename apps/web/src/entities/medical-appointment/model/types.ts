export interface MedicalAppointment {
  id: string
  eventId: string
  patientDui: string
  bookingReason: string
  bookedAt: string
}

export interface AppointmentSummary {
  id: string
  eventId: string
  patientDui: string
  bookingReason: string | null
  bookedAt: string
  eventDate: string
  startTime: string
  endTime: string
  availabilityStatus: string
  mainDiagnosis?: string | null
  prescribedTreatment?: string | null
}
