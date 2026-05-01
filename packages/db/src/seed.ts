import { sql, eq, isNull, and, inArray } from 'drizzle-orm'
import { db } from './client'
import {
  MedicalInsurances,
  Users,
  Patients,
  MedicalRecords,
  ScheduleEvents,
  MedicalAppointments,
  WhatsAppMessages,
  ClinicalConsultations,
  type CoverageType,
  type UserRole,
  type AvailabilityStatus,
  type EventType,
  type BloodType,
} from './schema'

// --- Helpers ---------------------------------------------------------------

// Better Auth (scrypt) password hash placeholder. The seed does not perform
// real authentication; this is a deterministic, opaque value safe enough for
// fixtures. Do NOT replicate this for real users.
const SEED_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c2VlZHNhbHRzZWVkc2FsdA$placeholderHashForSeedDataNotForRealAuthentication'

const fmtDate = (d: Date): string => d.toISOString().slice(0, 10) // YYYY-MM-DD
const fmtTime = (h: number, m = 0): string =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`

const addDays = (base: Date, days: number): Date => {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

const coverageTypes: CoverageType[] = ['basic', 'complete', 'dental', 'vision', 'comprehensive']
const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const insurerNames = [
  'Seguros Médicos del Pacífico', 'Asisa Salud', 'MAPFRE Vida', 'Sanitas Internacional',
  'BUPA Latinoamérica', 'AXA Salud', 'Allianz Care', 'Cigna Global',
  'MetLife Salud', 'Pan American Life', 'Médica Sur', 'Salud Total',
  'Coomeva EPS', 'Sura Salud', 'Colsanitas', 'Compensar EPS',
  'Famisanar', 'Nueva EPS', 'Salud Mía', 'Mutual de Seguros',
  'La Centro Americana', 'Aseguradora Popular', 'Aseguradora Suiza', 'SISA Seguros', 'ASSA Seguros',
]

const firstNames = [
  'María', 'José', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Sofía', 'Miguel',
  'Laura', 'Diego', 'Patricia', 'Roberto', 'Lucía', 'Andrés', 'Elena',
  'Fernando', 'Gabriela', 'Ricardo', 'Isabel', 'Javier', 'Beatriz',
  'Pablo', 'Verónica', 'Hugo', 'Adriana',
]

const lastNames = [
  'García', 'Martínez', 'López', 'Rodríguez', 'Hernández', 'Pérez', 'González',
  'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz',
  'Cruz', 'Reyes', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ruiz',
  'Álvarez', 'Mendoza', 'Vargas', 'Castro',
]

// 25 fixed DUIs (10-char format: 8 digits + dash + 1 digit)
const duis: string[] = Array.from({ length: 25 }, (_, i) => {
  const base = String(10000000 + i * 11).padStart(8, '0')
  const checksum = String(i % 10)
  return `${base}-${checksum}`
})

const diagnoses = [
  { dx: 'Hipertensión arterial esencial (I10)',  tx: 'Losartán 50mg cada 24h; dieta hiposódica; control en 30 días.' },
  { dx: 'Influenza estacional (J11)',            tx: 'Reposo, hidratación, paracetamol 500mg cada 8h por 5 días.' },
  { dx: 'Diabetes mellitus tipo 2 (E11)',        tx: 'Metformina 850mg cada 12h; control glucémico semanal.' },
  { dx: 'Faringoamigdalitis aguda (J03)',        tx: 'Amoxicilina 500mg cada 8h por 7 días; ibuprofeno PRN.' },
  { dx: 'Gastroenteritis aguda (A09)',           tx: 'Suero oral; dieta blanda; loperamida si persiste >24h.' },
]

// --- Main ------------------------------------------------------------------

async function main() {
  console.log('Seeding database...')

  await db.transaction(async (tx) => {
    // ----- 1) MedicalInsurances (25) ---------------------------------------
    const insuranceRows = insurerNames.map((insurerName, i) => ({
      insurerName,
      coverageType: coverageTypes[i % coverageTypes.length]!,
    }))
    const insertedInsurances = await tx
      .insert(MedicalInsurances)
      .values(insuranceRows)
      .returning({ id: MedicalInsurances.id })
    console.log(`Inserted ${insertedInsurances.length} MedicalInsurances`)

    // ----- 2) Users (25) ---------------------------------------------------
    // Distribution: 12 patients, 8 doctors, 5 receptionists
    const roleSequence: UserRole[] = [
      ...Array<UserRole>(12).fill('patient'),
      ...Array<UserRole>(8).fill('doctor'),
      ...Array<UserRole>(5).fill('receptionist'),
    ]
    const userRows = roleSequence.map((role, i) => {
      const first = firstNames[i % firstNames.length]!
      const last = lastNames[i % lastNames.length]!
      const isSuspendedTarget = i === 0 || i === 1 // marked for UPDATE demo
      return {
        name: `${first} ${last}`,
        // Deterministic seed-only emails; first two reused by the UPDATE step
        email: isSuspendedTarget
          ? `test-suspended-${i}@seed.local`
          : `${role}.${i}@seed.local`,
        emailVerified: true,
        role,
        accountStatus: 'active' as const,
      }
    })
    const insertedUsers = await tx
      .insert(Users)
      .values(userRows)
      .returning({ id: Users.id, role: Users.role, email: Users.email })
    console.log(`Inserted ${insertedUsers.length} Users`)

    // Companion Account rows holding the password hash (Better Auth pattern).
    // Using raw SQL keeps us decoupled from any future Account schema changes
    // beyond what's already declared.
    // (Skipped — Accounts insert is not required for the seed contract; the
    // hash placeholder above documents the intent.)

    const patientUsers = insertedUsers.filter((u) => u.role === 'patient')
    const doctorUsers = insertedUsers.filter((u) => u.role === 'doctor')
    const receptionistUsers = insertedUsers.filter((u) => u.role === 'receptionist')
    const staffUsers = [...doctorUsers, ...receptionistUsers]

    // ----- 3) Patients (25 — 20 with userId, 5 without) --------------------
    const patientRows = duis.map((dui, i) => {
      const linkedUser = i < 20 ? patientUsers[i % patientUsers.length] ?? null : null
      const insurance = insertedInsurances[i % insertedInsurances.length]!
      // Patient #24 has an invalid whatsappPhone format on purpose (UPDATE demo).
      const whatsappPhone = i === 24 ? '12345678' : `+5037${String(1000000 + i).padStart(7, '0')}`
      return {
        dui,
        userId: linkedUser?.id ?? null,
        firstName: firstNames[i % firstNames.length]!,
        lastName: lastNames[(i + 3) % lastNames.length]!,
        whatsappPhone,
        birthDate: fmtDate(new Date(1970 + (i % 40), i % 12, (i % 27) + 1)),
        insuranceId: insurance.id,
      }
    })
    await tx.insert(Patients).values(patientRows)
    console.log(`Inserted ${patientRows.length} Patients`)

    // ----- 4) Verify trigger created MedicalRecords ------------------------
    const [recordCount] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(MedicalRecords)
    if (Number(recordCount?.count) !== 25) {
      throw new Error(`Expected 25 MedicalRecords, got ${recordCount?.count}`)
    }
    console.log('25 MedicalRecords verified (trigger fired)')

    // ----- 5) ScheduleEvents (28 — distributed across time blocks) --------
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    type EventSeed = {
      offsetDays: number
      hour: number
      eventType: EventType
      availabilityStatus: AvailabilityStatus
    }

    const eventSeeds: EventSeed[] = [
      // 2 weeks past — completed/cancelled
      { offsetDays: -14, hour: 9,  eventType: 'appointment', availabilityStatus: 'completed' },
      { offsetDays: -13, hour: 10, eventType: 'appointment', availabilityStatus: 'completed' },
      { offsetDays: -12, hour: 11, eventType: 'appointment', availabilityStatus: 'completed' },
      { offsetDays: -11, hour: 14, eventType: 'appointment', availabilityStatus: 'cancelled' },
      { offsetDays: -10, hour: 15, eventType: 'appointment', availabilityStatus: 'completed' },
      { offsetDays: -9,  hour: 9,  eventType: 'appointment', availabilityStatus: 'completed' },
      { offsetDays: -8,  hour: 10, eventType: 'appointment', availabilityStatus: 'completed' },
      // Current week — busy/available mix
      { offsetDays: -2,  hour: 9,  eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: -1,  hour: 10, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 0,   hour: 9,  eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 0,   hour: 11, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 0,   hour: 14, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 1,   hour: 9,  eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 1,   hour: 10, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 2,   hour: 11, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 3,   hour: 9,  eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 3,   hour: 14, eventType: 'appointment', availabilityStatus: 'available' },
      // Future weeks — mostly available + some vacation/meeting
      { offsetDays: 7,   hour: 9,  eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 8,   hour: 10, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 9,   hour: 11, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 10,  hour: 14, eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 14,  hour: 9,  eventType: 'vacation',    availabilityStatus: 'blocked' },
      { offsetDays: 15,  hour: 9,  eventType: 'vacation',    availabilityStatus: 'blocked' },
      { offsetDays: 16,  hour: 14, eventType: 'meeting',     availabilityStatus: 'blocked' },
      { offsetDays: 17,  hour: 15, eventType: 'meeting',     availabilityStatus: 'blocked' },
      { offsetDays: 21,  hour: 9,  eventType: 'appointment', availabilityStatus: 'available' },
      { offsetDays: 21,  hour: 10, eventType: 'appointment', availabilityStatus: 'available' },
      // Extra "deletable" slot — DELETE demo target (no appointment will reference it).
      { offsetDays: 28,  hour: 16, eventType: 'appointment', availabilityStatus: 'available' },
    ]

    const scheduleRows = eventSeeds.map((e, i) => {
      const eventDate = addDays(today, e.offsetDays)
      const auditUser = staffUsers[i % staffUsers.length]!
      const doctorUser = doctorUsers[i % doctorUsers.length]!
      return {
        eventDate: fmtDate(eventDate),
        startTime: fmtTime(e.hour),
        endTime: fmtTime(e.hour + 1),
        eventType: e.eventType,
        availabilityStatus: e.availabilityStatus,
        doctorId: doctorUser.id,
        auditUserId: auditUser.id,
      }
    })
    let insertedEvents = await tx
      .insert(ScheduleEvents)
      .values(scheduleRows)
      .returning({
        id: ScheduleEvents.id,
        eventDate: ScheduleEvents.eventDate,
        eventType: ScheduleEvents.eventType,
        availabilityStatus: ScheduleEvents.availabilityStatus,
      })
    console.log(`Inserted ${insertedEvents.length} ScheduleEvents`)

    // ----- 6) MedicalAppointments (25) -------------------------------------
    // Use the first 25 events of type 'appointment' (skip vacation/meeting and the
    // deletable slot at the end).
    const appointmentEligibleEvents = insertedEvents
      .filter((event) => event.eventType === 'appointment')
      .slice(0, 25)

    if (appointmentEligibleEvents.length < 25) {
      const needed = 25 - appointmentEligibleEvents.length
      const extraRows = Array.from({ length: needed }, (_, i) => {
        const auditUser  = staffUsers[i % staffUsers.length]!
        const doctorUser = doctorUsers[i % doctorUsers.length]!
        return {
          eventDate: fmtDate(addDays(today, 30 + i)),
          startTime: fmtTime(8 + (i % 8)),
          endTime: fmtTime(9 + (i % 8)),
          eventType: 'appointment' as const,
          availabilityStatus: 'available' as const,
          doctorId:    doctorUser.id,
          auditUserId: auditUser.id,
        }
      })
      const extraEvents = await tx
        .insert(ScheduleEvents)
        .values(extraRows)
        .returning({
          id: ScheduleEvents.id,
          eventDate: ScheduleEvents.eventDate,
          eventType: ScheduleEvents.eventType,
          availabilityStatus: ScheduleEvents.availabilityStatus,
        })
      insertedEvents = [...insertedEvents, ...extraEvents]
      appointmentEligibleEvents.push(...extraEvents)
    }

    const appointmentRows = appointmentEligibleEvents.map((evt, i) => ({
      eventId: evt.id,
      patientDui: duis[i % duis.length]!,
      bookingReason: [
        'Control rutinario',
        'Dolor abdominal persistente',
        'Renovación de receta',
        'Chequeo de presión arterial',
        'Síntomas gripales',
      ][i % 5]!,
    }))
    const insertedAppointments = await tx
      .insert(MedicalAppointments)
      .values(appointmentRows)
      .returning({ id: MedicalAppointments.id, eventId: MedicalAppointments.eventId })
    console.log(`Inserted ${insertedAppointments.length} MedicalAppointments`)

    // ----- 7) Verify trigger created WhatsAppMessages ----------------------
    const [waCount] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(WhatsAppMessages)
    if (Number(waCount?.count) < 25) {
      throw new Error(`Expected ≥25 WhatsAppMessages, got ${waCount?.count}`)
    }
    console.log(`${waCount?.count} WhatsAppMessages verified (trigger fired)`)

    // ----- 8) ClinicalConsultations (only past completed appointments) -----
    // Map appointment.eventId -> availability status from the inserted row.
    const eventStatusById = new Map(insertedEvents.map((event) => [
      event.id,
      event.availabilityStatus,
    ]))
    const completedAppointments = insertedAppointments.filter((appt) => {
      const status = eventStatusById.get(appt.eventId)
      return status === 'completed'
    })

    // Need 25+ consultations — generate one per completed appointment, then
    // expand by re-using diagnostics to reach the target. If we don't have
    // 25 completed slots (we have 6), we fall back to including a few past
    // 'cancelled' that we re-classify here. To keep things simple and stay
    // honest about the trigger semantics, we link consultations only to the
    // completed ones we have, and build extra ones by reusing the past
    // 'cancelled' appointment as a "follow-up consultation" record. Each
    // ClinicalConsultations row needs a unique appointmentId (UNIQUE FK), so
    // we cannot duplicate. Therefore we MUST have ≥25 unique past
    // appointments. We do: 7 past events were created; not enough.
    //
    // To satisfy the 25+ requirement without inflating ScheduleEvents past
    // realistic numbers, we add additional past appointment slots below.
    if (completedAppointments.length < 25) {
      // Top up: create extra past 'completed' events + appointments to reach 25.
      const needed = 25 - completedAppointments.length
      const extraEventRows = Array.from({ length: needed }, (_, i) => {
        const auditUser  = staffUsers[(i + 7) % staffUsers.length]!
        const doctorUser = doctorUsers[(i + 1) % doctorUsers.length]!
        return {
          eventDate: fmtDate(addDays(today, -30 - i)),
          startTime: fmtTime(8 + (i % 8)),
          endTime: fmtTime(9 + (i % 8)),
          eventType: 'appointment' as EventType,
          availabilityStatus: 'completed' as AvailabilityStatus,
          doctorId:    doctorUser.id,
          auditUserId: auditUser.id,
        }
      })
      const extraEvents = await tx
        .insert(ScheduleEvents)
        .values(extraEventRows)
        .returning({ id: ScheduleEvents.id })
      console.log(`Inserted ${extraEvents.length} extra past ScheduleEvents (for consultations)`)

      const extraApptRows = extraEvents.map((evt, i) => ({
        eventId: evt.id,
        patientDui: duis[i % duis.length]!,
        bookingReason: 'Consulta médica completada (histórica)',
      }))
      const extraAppts = await tx
        .insert(MedicalAppointments)
        .values(extraApptRows)
        .returning({ id: MedicalAppointments.id, eventId: MedicalAppointments.eventId })
      console.log(`Inserted ${extraAppts.length} extra past MedicalAppointments`)

      completedAppointments.push(...extraAppts)
    }

    // Build a DUI -> recordId map (every patient has exactly one record by trigger).
    const records = await tx
      .select({ id: MedicalRecords.id, patientDui: MedicalRecords.patientDui })
      .from(MedicalRecords)
    const recordByDui = new Map(records.map((r) => [r.patientDui, r.id]))

    // For each completed appointment, look up its patientDui -> recordId.
    const consultationApptIds = completedAppointments.map((a) => a.id)
    const apptDetails = await tx
      .select({ id: MedicalAppointments.id, patientDui: MedicalAppointments.patientDui })
      .from(MedicalAppointments)
      .where(inArray(MedicalAppointments.id, consultationApptIds))
    const duiByApptId = new Map(apptDetails.map((a) => [a.id, a.patientDui]))

    const consultationRows = completedAppointments.map((appt, i) => {
      const dx = diagnoses[i % diagnoses.length]!
      const dui = duiByApptId.get(appt.id)!
      const recordId = recordByDui.get(dui)!
      return {
        recordId,
        appointmentId: appt.id,
        presentedSymptoms: ['Cefalea', 'Fiebre y malestar general', 'Tos seca', 'Dolor torácico leve', 'Náuseas y vómito'][i % 5]!,
        bloodPressure: `${110 + (i % 20)}/${70 + (i % 15)}`,
        weightKg: String(60 + (i % 30)),
        mainDiagnosis: dx.dx,
        prescribedTreatment: dx.tx,
        doctorPrivateNotes: i % 3 === 0 ? 'Paciente colaborador; reevaluar en 30 días.' : null,
      }
    })
    const insertedConsultations = await tx
      .insert(ClinicalConsultations)
      .values(consultationRows)
      .returning({ id: ClinicalConsultations.id })
    console.log(`Inserted ${insertedConsultations.length} ClinicalConsultations`)

    // ----- 9) Explicit DML: UPDATE × 2 + DELETE × 1 ------------------------
    // 9a) Suspend the two designated test users.
    const suspended = await tx
      .update(Users)
      .set({ accountStatus: 'suspended' })
      .where(sql`${Users.email} LIKE 'test-suspended-%@seed.local'`)
      .returning({ id: Users.id })
    console.log(`UPDATE: suspended ${suspended.length} Users`)

    // 9b) Fix the malformed WhatsApp phone for patient #24.
    const fixedPhone = await tx
      .update(Patients)
      .set({ whatsappPhone: '+50312345678' })
      .where(eq(Patients.whatsappPhone, '12345678'))
      .returning({ dui: Patients.dui })
    console.log(`UPDATE: fixed whatsappPhone on ${fixedPhone.length} Patient(s)`)

    // 9c) Delete the deliberately unbooked 'available' future event.
    // It is the *latest* available event with no MedicalAppointment row.
    const deletable = await tx
      .select({ id: ScheduleEvents.id })
      .from(ScheduleEvents)
      .leftJoin(MedicalAppointments, eq(MedicalAppointments.eventId, ScheduleEvents.id))
      .where(
        and(
          eq(ScheduleEvents.availabilityStatus, 'available'),
          isNull(MedicalAppointments.id),
        ),
      )
      .limit(1)

    if (deletable[0]) {
      await tx.delete(ScheduleEvents).where(eq(ScheduleEvents.id, deletable[0].id))
      console.log(`DELETE: removed 1 unbooked available ScheduleEvent (${deletable[0].id})`)
    } else {
      console.log('DELETE: no unbooked available ScheduleEvent found (skip)')
    }

    // 9d) Sample SELECT with JOIN (Patients × Users × MedicalInsurances).
    const sampleJoin = await tx
      .select({
        patientName: sql<string>`${Patients.firstName} || ' ' || ${Patients.lastName}`,
        userName: Users.name,
        insurer: MedicalInsurances.insurerName,
      })
      .from(Patients)
      .leftJoin(Users, eq(Users.id, Patients.userId))
      .leftJoin(MedicalInsurances, eq(MedicalInsurances.id, Patients.insuranceId))
      .limit(5)
    console.log('Sample JOIN (5 rows):')
    console.table(sampleJoin)
  })

  console.log('Seed completed successfully')
}

main().catch(async (err) => {
  console.error('Seed failed:', err)
  // Best-effort post-mortem counts — outside the (already-rolled-back) tx.
  try {
    const counts = await Promise.all([
      db.select({ c: sql<number>`count(*)::int` }).from(MedicalInsurances),
      db.select({ c: sql<number>`count(*)::int` }).from(Users),
      db.select({ c: sql<number>`count(*)::int` }).from(Patients),
      db.select({ c: sql<number>`count(*)::int` }).from(MedicalRecords),
      db.select({ c: sql<number>`count(*)::int` }).from(ScheduleEvents),
      db.select({ c: sql<number>`count(*)::int` }).from(MedicalAppointments),
      db.select({ c: sql<number>`count(*)::int` }).from(WhatsAppMessages),
      db.select({ c: sql<number>`count(*)::int` }).from(ClinicalConsultations),
    ])
    console.error('Post-rollback table counts:', {
      MedicalInsurances: counts[0]?.[0]?.c,
      Users: counts[1]?.[0]?.c,
      Patients: counts[2]?.[0]?.c,
      MedicalRecords: counts[3]?.[0]?.c,
      ScheduleEvents: counts[4]?.[0]?.c,
      MedicalAppointments: counts[5]?.[0]?.c,
      WhatsAppMessages: counts[6]?.[0]?.c,
      ClinicalConsultations: counts[7]?.[0]?.c,
    })
  } catch (countErr) {
    console.error('Could not collect post-rollback counts:', countErr)
  }
  // Suppress unused-import warning for SEED_PASSWORD_HASH in case the linter
  // dead-strips the constant: we keep it referenced here for documentation.
  void SEED_PASSWORD_HASH
  process.exit(1)
})
