'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientApi } from '@/shared/api/client'
import {
  bookAppointmentSchema,
  type BookAppointmentValues,
} from '@/entities/medical-appointment'
import type { AvailableSlotOutput } from '@project/api/src/modules/receptionist-schedule/application/dtos/outputs/available-slot.output'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'

interface ReservarCitaFormProps {
  slot: AvailableSlotOutput
}

interface ConfirmedAppointment {
  id:            string
  bookingReason: string
}

function formatTime(value: string): string {
  return value.slice(0, 5)
}

export function ReservarCitaForm({ slot }: ReservarCitaFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [slotTaken, setSlotTaken] = useState(false)
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookAppointmentValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: { eventId: slot.id, bookingReason: '' },
  })

  const reasonValue = watch('bookingReason') ?? ''

  function onSubmit(values: BookAppointmentValues) {
    setServerError(null)
    setSlotTaken(false)
    startTransition(async () => {
      const { data, error } = await clientApi.appointments.post({
        eventId:       values.eventId,
        bookingReason: values.bookingReason,
      })
      if (error) {
        const status: number = error.status
        if (status === 422) {
          router.push('/complete-profile')
          return
        }
        if (status === 409) {
          setSlotTaken(true)
          return
        }
        const value = error.value
        const message =
          value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
            ? value.message
            : 'No se pudo confirmar tu cita. Intenta de nuevo.'
        setServerError(message)
        return
      }
      if (data) {
        setConfirmed({ id: data.id, bookingReason: data.bookingReason })
      }
    })
  }

  if (confirmed) {
    return (
      <Card className="space-y-3 p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl">Cita confirmada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <p className="text-sm text-foreground">
            Tu cita ha sido reservada para el <strong>{slot.eventDate}</strong> de{' '}
            <strong>{formatTime(slot.startTime)}</strong> a{' '}
            <strong>{formatTime(slot.endTime)}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">Motivo: {confirmed.bookingReason}</p>
          <div className="flex gap-2">
            <Link href="/dashboard/patient" className={buttonVariants({ variant: 'outline' })}>
              Volver al inicio
            </Link>
            <Link href="/mis-citas" className={buttonVariants()}>
              Ver mis citas
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (slotTaken) {
    return (
      <Card className="space-y-3 p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl">Cupo no disponible</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <Alert variant="destructive" className="text-sm">
            Ese cupo ya no está disponible, elige otro horario.
          </Alert>
          <Link href="/disponibilidad" className={buttonVariants()}>
            Ver disponibilidad
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="p-4 border-primary/30 bg-primary/5">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Horario seleccionado</p>
        <p className="text-base font-semibold text-foreground mt-1">{slot.eventDate}</p>
        <p className="text-sm text-muted-foreground">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </p>
      </Card>

      {serverError && (
        <Alert variant="destructive" className="text-sm">
          {serverError}
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="bookingReason">Motivo de consulta</Label>
        <Textarea
          id="bookingReason"
          rows={4}
          placeholder="Describe brevemente el motivo de tu consulta"
          {...register('bookingReason')}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{errors.bookingReason?.message ?? ' '}</span>
          <span>{reasonValue.length}/500</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Confirmando…' : 'Confirmar cita'}
      </Button>
    </form>
  )
}
