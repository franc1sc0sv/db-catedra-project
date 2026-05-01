import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarClock, CalendarPlus, FileText } from 'lucide-react'
import { requireAuth } from '@/shared/auth/guards.server'
import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import type { User } from '@/entities/user'

interface PatientDashboardPageProps {
  user: User
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

export async function PatientDashboardPage({ user }: PatientDashboardPageProps) {
  const api = await createServerApi()

  const { data: patient, error: patientError } = await api.patients.me.get()

  if (patientError || !patient) {
    redirect('/complete-profile')
  }

  const { data: appointmentsData } = await api.appointments.my.get({
    query: { page: '1', pageSize: '3' },
  })

  const upcoming = appointmentsData?.upcoming ?? []

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Paciente</p>
        <h1>Bienvenido, {patient.firstName}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </header>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/disponibilidad"
          className={buttonVariants({ variant: 'default', size: 'lg' }) + ' flex gap-2 h-auto py-4'}
        >
          <CalendarPlus className="h-5 w-5" />
          Reservar una cita
        </Link>
        <Link
          href="/mis-citas"
          className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' flex gap-2 h-auto py-4'}
        >
          <CalendarClock className="h-5 w-5" />
          Ver mis citas
        </Link>
      </div>

      {/* Próximas citas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Próximas citas
          </CardTitle>
          <CardDescription>Tus citas agendadas más cercanas</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">No tienes citas próximas agendadas.</p>
              <Link href="/disponibilidad" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Agendar ahora
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((cita) => (
                <li key={cita.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{cita.eventDate}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(cita.startTime)} – {formatTime(cita.endTime)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {cita.bookingReason}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}