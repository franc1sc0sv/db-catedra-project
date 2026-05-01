import { createServerApi } from '@/shared/api/server'
import {
  CalendarioDisponibilidadWidget,
  parseWeekParam,
} from '@/widgets/calendario-disponibilidad'
import { DoctorPicker } from '@/features/doctor-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface DisponibilidadPageProps {
  doctorId?: string
  week?:     string
}

export async function DisponibilidadPage({ doctorId, week }: DisponibilidadPageProps) {
  const api = await createServerApi()
  const { data: doctors, error: doctorsError } = await api.users.doctors.get()

  if (doctorsError || !doctors) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Disponibilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="text-sm">
            No se pudo cargar la lista de médicos. Intenta de nuevo más tarde.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const selectedDoctor = doctorId ? doctors.find((d) => d.id === doctorId) : undefined

  if (!selectedDoctor) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pacientes</p>
          <h1>Selecciona un médico</h1>
          <p className="text-muted-foreground mt-1">
            Elige al profesional con quien deseas reservar tu cita.
          </p>
        </header>
        <DoctorPicker
          doctors={doctors}
          baseHref="/disponibilidad"
          extraQuery={{ week }}
        />
      </div>
    )
  }

  const range = parseWeekParam(week)
  const { data: slots, error: slotsError } = await api['schedule-events'].get({
  query: {
    doctor_id: selectedDoctor.id,
    date_from: range.dateFrom,
    date_to:   range.dateTo,
  },
  fetch: { cache: 'no-store' },
})

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Disponibilidad de {selectedDoctor.name}
        </p>
        <h1>Horarios disponibles</h1>
        <CardDescription>
          Cambia de médico abajo para ver otra agenda.
        </CardDescription>
      </header>

      <DoctorPicker
        doctors={doctors}
        baseHref="/disponibilidad"
        currentId={selectedDoctor.id}
        extraQuery={{ week }}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Semana {range.iso}</CardTitle>
        </CardHeader>
        <CardContent>
          {slotsError ? (
            <Alert variant="destructive" className="text-sm">
              No se pudo cargar la disponibilidad. Intenta de nuevo más tarde.
            </Alert>
          ) : (
            <CalendarioDisponibilidadWidget
              slots={slots}
              currentWeek={range.iso}
              days={range.days}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
