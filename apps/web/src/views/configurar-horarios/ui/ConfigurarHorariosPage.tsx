import { ConfigurarHorariosForm } from '@/features/schedule-config'

export function ConfigurarHorariosPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
        <h1>Configurar Horarios</h1>
        <p className="text-muted-foreground mt-1">
          Define los bloques de disponibilidad para que los pacientes puedan reservar.
        </p>
      </header>
      <ConfigurarHorariosForm />
    </div>
  )
}
