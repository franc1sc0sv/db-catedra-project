import { sql } from 'drizzle-orm'
import { db } from '../client'

export interface FrequentPatient {
  dui: string
  firstName: string
  lastName: string
  appointmentCount: number
}

export interface DailyAvailability {
  eventDate: string
  availableSlots: number
}

export interface AppointmentWithoutConsultation {
  id: string
  patientDui: string
  doctorId: string | null
  appointmentDate: string
  status: string
}

/**
 * Subconsulta correlacionada en WHERE — pacientes con más de una cita.
 * La subquery cuenta filas de MedicalAppointments por cada paciente externo.
 */
export async function getFrequentPatients(): Promise<FrequentPatient[]> {
  const result = await db.execute(sql`
    SELECT
      p.dui,
      p."firstName"  AS "firstName",
      p."lastName"   AS "lastName",
      (
        SELECT COUNT(*)
        FROM "MedicalAppointments" ma
        WHERE ma."patientDui" = p.dui
      )::int AS "appointmentCount"
    FROM "Patients" p
    WHERE (
      SELECT COUNT(*)
      FROM "MedicalAppointments" ma
      WHERE ma."patientDui" = p.dui
    ) > 1
    ORDER BY "appointmentCount" DESC
  `)
  return result.rows as unknown as FrequentPatient[]
}

/**
 * Tabla derivada en FROM — slots disponibles agrupados por día durante 7 días.
 * La subquery interna actúa como tabla virtual sobre la que se agrupa y cuenta.
 */
export async function getWeeklyAvailability(): Promise<DailyAvailability[]> {
  const result = await db.execute(sql`
    SELECT
      available_days."eventDate"             AS "eventDate",
      COUNT(*)::int                          AS "availableSlots"
    FROM (
      SELECT "eventDate"
      FROM "ScheduleEvents"
      WHERE "availabilityStatus" = 'available'
        AND "eventDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    ) AS available_days
    GROUP BY available_days."eventDate"
    ORDER BY available_days."eventDate"
  `)
  return result.rows as unknown as DailyAvailability[]
}

/**
 * NOT EXISTS — citas médicas sin consulta clínica registrada.
 * Se une con ScheduleEvents para exponer doctorId, appointmentDate y status.
 */
export async function findAppointmentsWithoutConsultation(): Promise<AppointmentWithoutConsultation[]> {
  const result = await db.execute(sql`
    SELECT
      ma.id                       AS "id",
      ma."patientDui"             AS "patientDui",
      se."auditUserId"            AS "doctorId",
      se."eventDate"              AS "appointmentDate",
      se."availabilityStatus"     AS "status"
    FROM "MedicalAppointments" ma
    INNER JOIN "ScheduleEvents" se ON se.id = ma."eventId"
    WHERE NOT EXISTS (
      SELECT 1
      FROM "ClinicalConsultations" cc
      WHERE cc."appointmentId" = ma.id
    )
    ORDER BY se."eventDate" DESC
  `)
  return result.rows as unknown as AppointmentWithoutConsultation[]
}
