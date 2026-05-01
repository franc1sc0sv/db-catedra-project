import { createServerApi } from '@/shared/api/server'
import { AgendaTableWidget, DateNav } from '@/widgets/agenda-table'
import { BloquearHorariosDialog } from '@/features/block-schedule'
import { DoctorPicker } from '@/features/doctor-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface AgendaSecretariaPageProps {
  doctorId?: string
  fecha:     string
}

export async function AgendaSecretariaPage({ doctorId, fecha }: AgendaSecretariaPageProps) {
  const api = await createServerApi()
  const { data: doctors, error: doctorsError } = await api.users.doctors.get()

  if (doctorsError || !doctors) {
    return (
      <div className="space-y-4">
        <h1>Agenda</h1>
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la lista de médicos.
        </Alert>
      </div>
    )
  }

  const selectedDoctor = doctorId ? doctors.find((d) => d.id === doctorId) : undefined

  if (!selectedDoctor) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reception</p>
          <h1>Selecciona un médico</h1>
          <p className="text-muted-foreground mt-1">
            Elige al profesional para administrar su agenda.
          </p>
        </header>
        <DoctorPicker
          doctors={doctors}
          baseHref="/agenda"
          extraQuery={{ fecha }}
        />
      </div>
    )
  }

  const { data, error } = await api.agenda.daily.get({
    query: { doctor_id: selectedDoctor.id, fecha },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reception</p>
          <h1>Agenda de {selectedDoctor.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Fecha: {fecha}</p>
        </div>
        <div className="flex items-center gap-3">
          <DateNav fecha={fecha} doctorId={selectedDoctor.id} />
          <BloquearHorariosDialog doctorId={selectedDoctor.id} />
        </div>
      </div>

      <DoctorPicker
        doctors={doctors}
        baseHref="/agenda"
        currentId={selectedDoctor.id}
        extraQuery={{ fecha }}
      />

      {error ? (
        <Card>
          <CardContent>
            <Alert variant="destructive" className="text-sm">
              No se pudo cargar la agenda. Intenta nuevamente más tarde.
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Slots del día</CardTitle>
          </CardHeader>
          <CardContent>
            <AgendaTableWidget items={data} fecha={fecha} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
