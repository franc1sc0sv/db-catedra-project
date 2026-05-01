export interface Patient {
  dui: string
  userId: string | null
  firstName: string
  lastName: string
  whatsappPhone: string
  birthDate: string
  insuranceId: string | null
}

export interface PatientProfile {
  dui: string
  firstName: string
  lastName: string
  birthDate: string
  whatsappPhone: string
  insuranceId: string | null
}
