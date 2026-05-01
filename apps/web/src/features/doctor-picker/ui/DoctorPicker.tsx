import Link from 'next/link'
import { Stethoscope } from 'lucide-react'
import type { DoctorRefOutput } from '@project/api/src/modules/users/application/dtos/outputs/user.output'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DoctorPickerProps {
  doctors:     DoctorRefOutput[]
  baseHref:    string
  currentId?:  string
  paramName?:  string
  extraQuery?: Record<string, string | undefined>
}

function buildHref(
  baseHref: string,
  paramName: string,
  doctorId: string,
  extra: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value)
  }
  params.set(paramName, doctorId)
  return `${baseHref}?${params.toString()}`
}

export function DoctorPicker({
  doctors,
  baseHref,
  currentId,
  paramName = 'doctor_id',
  extraQuery = {},
}: DoctorPickerProps) {
  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No hay médicos activos disponibles.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => {
        const active = doctor.id === currentId
        return (
          <Link
            key={doctor.id}
            href={buildHref(baseHref, paramName, doctor.id, extraQuery)}
            className={cn(
              'group flex items-center gap-3 rounded-lg border p-4 transition-all',
              active
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
              )}
            >
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-sm font-semibold', active ? 'text-primary' : 'text-foreground')}>
                {doctor.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {active ? 'Seleccionado' : 'Ver agenda'}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
