export interface ClinicalConsultation {
  id: string
  recordId: string
  appointmentId: string
  presentedSymptoms: string
  bloodPressure: string | null
  weightKg: string | null
  mainDiagnosis: string
  prescribedTreatment: string
  doctorPrivateNotes: string | null
}
