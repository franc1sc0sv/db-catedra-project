import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'
import type {
  PastAppointmentDto,
  UpcomingAppointmentDto,
} from '@project/api/src/modules/appointments/application/dtos/outputs/my-appointments.output'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

interface AppointmentListWidgetProps {
  upcoming: UpcomingAppointmentDto[]
  past:     PastAppointmentDto[]
}

function formatTime(value: string): string {
  return value.slice(0, 5)
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'completed' ? 'success'
    : status === 'cancelled' ? 'destructive'
    : 'secondary'
  return <Badge variant={variant}>{status}</Badge>
}

export function AppointmentListWidget({ upcoming, past }: AppointmentListWidgetProps) {
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarPlus className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Aún no tienes citas</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Reserva tu primera cita en la sección de disponibilidad.
        </p>
        <Link href="/disponibilidad" className={buttonVariants()}>
          Ver disponibilidad
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Próximas citas</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tienes citas próximas.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((appt) => (
              <li key={appt.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {appt.eventDate} · {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{appt.bookingReason}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Citas pasadas</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tienes citas pasadas.</p>
        ) : (
          <ul className="space-y-2">
            {past.map((appt) => (
              <li key={appt.id}>
                <Card className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {appt.eventDate} · {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{appt.bookingReason}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                  {appt.mainDiagnosis && (
                    <div className="text-xs text-muted-foreground border-t border-border pt-2">
                      <p>
                        <span className="font-semibold text-foreground">Diagnóstico:</span> {appt.mainDiagnosis}
                      </p>
                      {appt.prescribedTreatment && (
                        <p className="mt-1">
                          <span className="font-semibold text-foreground">Tratamiento:</span>{' '}
                          {appt.prescribedTreatment}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

interface AppointmentListWidgetCardProps extends AppointmentListWidgetProps {
  title?: string
}

export function AppointmentListWidgetCard({ title = 'Mis citas', upcoming, past }: AppointmentListWidgetCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AppointmentListWidget upcoming={upcoming} past={past} />
      </CardContent>
    </Card>
  )
}
