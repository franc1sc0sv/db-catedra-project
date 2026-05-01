import { requireRole } from '@/shared/auth/guards.server'
import { UserRole } from '@project/enums/src/user-role.enum'
import { AgendaDoctorClient } from './AgendaDoctorClient'

interface AgendaDoctorPageProps {
  fecha: string
}

export async function AgendaDoctorPage({ fecha }: AgendaDoctorPageProps) {
  await requireRole([UserRole.Doctor])

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
        <h1>Agenda</h1>
        <p className="text-muted-foreground mt-1">
          Consulta los bloques de tu jornada y revisa el estado de cada cita.
        </p>
      </header>
      <AgendaDoctorClient fecha={fecha} />
    </div>
  )
}
