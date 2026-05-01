export interface MedicalRecord {
  id: string
  patientDui: string
  bloodType: string | null
  knownAllergies: string | null
  familyHistory: string | null
  chronicConditions: string | null
  openedAt: string
}
