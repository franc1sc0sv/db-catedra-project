import 'reflect-metadata'
import { Elysia } from 'elysia'
import { BunAdapter } from 'elysia/adapter/bun'
import { cors } from '@elysiajs/cors'
import { container } from './common/ioc/bootstrap'
import { AppError } from './common/errors/app-error'
import { usersRoutes } from './modules/users/presentation/users.routes'
import { healthRoutes } from './modules/health/presentation/health.routes'
import { betterAuthPlugin } from './auth-plugin'
// <ROUTES_IMPORTS_START>
import { patientsRoutes } from './modules/patients/presentation/patients.routes'
import { scheduleEventsRoutes } from './modules/receptionist-schedule/presentation/receptionist-schedule.routes'
import { appointmentsRoutes } from './modules/appointments/presentation/appointments.routes'
import { agendaRoutes } from './modules/receptionist-agenda/presentation/receptionist-agenda.routes'
import { doctorScheduleRoutes } from './modules/doctor-schedule/presentation/doctor-schedule.routes'
import { doctorAgendaRoutes } from './modules/doctor-agenda/presentation/doctor-agenda.routes'
import { medicalRecordsRoutes } from './modules/medical-records/presentation/medical-records.routes'
// <ROUTES_IMPORTS_END>

export const app = new Elysia({ adapter: BunAdapter })
  .use(cors({
    origin:      process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3001',
    credentials: true,
  }))
  .decorate('container', container)
  .onError(({ error, code }) => {
    if (error instanceof AppError) {
      return Response.json(
        { message: error.message },
        { status: error.statusCode },
      )
    }
    if (code === 'VALIDATION') {
      return Response.json(
        { message: 'Validation failed', code },
        { status: 422 },
      )
    }
    if (code === 'NOT_FOUND') {
      return Response.json({ message: 'Not Found', code }, { status: 404 })
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return Response.json({ message, code }, { status: 500 })
  })
  .use(healthRoutes)
  .use(betterAuthPlugin)
  .use(usersRoutes)
  // <ROUTES_REGISTRATION_START>
  .use(patientsRoutes)
  .use(scheduleEventsRoutes)
  .use(appointmentsRoutes)
  .use(agendaRoutes)
  .use(doctorScheduleRoutes)
  .use(doctorAgendaRoutes)
  .use(medicalRecordsRoutes)
  // <ROUTES_REGISTRATION_END>

export type App = typeof app
