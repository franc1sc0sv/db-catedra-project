'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientApi } from '@/shared/api/client'
import {
  generateScheduleInputSchema,
  type GenerateScheduleInput,
  type PreviewScheduleOutput,
} from '@/entities/schedule-event'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { TimePicker } from '@/components/ui/time-picker'
import { cn } from '@/lib/utils'

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
] as const

const DURATIONS: Array<{ value: 15 | 30 | 45 | 60; label: string }> = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' },
]

function startOfTodayUtc(): Date {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today
}

function mondayOfCurrentWeek(): Date {
  const today = startOfTodayUtc()
  const day = today.getUTCDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = day === 0 ? -6 : 1 - day
  today.setUTCDate(today.getUTCDate() + diff)
  return today
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function offsetForDay(dayValue: number): number {
  return dayValue === 0 ? 6 : dayValue - 1
}

function formatLong(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function formatPreviewDate(d: string | Date): string {
  const date = d instanceof Date
    ? d
    : new Date(`${String(d).slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return String(d)
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' })
  const day     = date.toLocaleDateString('es-ES', { day: 'numeric', timeZone: 'UTC' })
  const month   = date.toLocaleDateString('es-ES', { month: 'long', timeZone: 'UTC' })
  return `${weekday} ${day} de ${month}`
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function nowPlus30Rounded(): string {
  const now = new Date()
  now.setSeconds(0, 0)
  now.setMinutes(now.getMinutes() + 30)
  const rem = now.getMinutes() % 15
  if (rem !== 0) now.setMinutes(now.getMinutes() + (15 - rem))
  if (now.getHours() >= 24) return '23:45'
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function ConfigurarHorariosForm() {
  const [previewState, setPreviewState] = useState<PreviewScheduleOutput | null>(null)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const [isPreviewing, startPreview] = useTransition()
  const [isConfirming, startConfirm] = useTransition()

  const monday = useMemo(mondayOfCurrentWeek, [])
  const today  = useMemo(startOfTodayUtc, [])
  const sunday = useMemo(() => addDays(monday, 6), [monday])

  const isPastDay = (dayValue: number): boolean =>
    addDays(monday, offsetForDay(dayValue)) < today

  const { register, handleSubmit, control, getValues, setValue, formState: { errors } } = useForm<GenerateScheduleInput>({
    resolver: zodResolver(generateScheduleInputSchema),
    defaultValues: {
      selectedDays:  [],
      startTime:     '08:00',
      endTime:       '12:00',
      slotDuration:  30,
      weekStartDate: isoDate(monday),
    },
  })

  const watchedSelectedDays = useWatch({ control, name: 'selectedDays' })
  const watchedStartTime    = useWatch({ control, name: 'startTime' })

  const todayWeekDay = useMemo(() => new Date().getDay(), [])
  const todayInRange = useMemo(
    () => addDays(monday, offsetForDay(todayWeekDay)) >= today,
    [monday, todayWeekDay, today],
  )

  const minStartTime = useMemo<string | undefined>(() => {
    if (!todayInRange) return undefined
    if (!watchedSelectedDays?.includes(todayWeekDay)) return undefined
    return nowPlus30Rounded()
  }, [todayInRange, watchedSelectedDays, todayWeekDay])

  useEffect(() => {
    if (minStartTime && watchedStartTime < minStartTime) {
      setValue('startTime', minStartTime, { shouldValidate: true, shouldDirty: true })
    }
  }, [minStartTime, watchedStartTime, setValue])

  function onPreviewSubmit(values: GenerateScheduleInput) {
    setFeedback(null)
    const sanitized: GenerateScheduleInput = {
      ...values,
      selectedDays: values.selectedDays.filter((d) => !isPastDay(d)),
    }
    if (sanitized.selectedDays.length === 0) {
      setFeedback({ kind: 'error', message: 'Selecciona al menos un día disponible.' })
      setPreviewState(null)
      return
    }
    startPreview(async () => {
      const { data, error } = await clientApi.doctor.schedule.preview.post(sanitized)
      if (error) {
        const message = typeof error.value === 'object' && error.value && 'message' in error.value
          ? String((error.value as { message: unknown }).message)
          : 'No se pudo generar la vista previa'
        setFeedback({ kind: 'error', message })
        setPreviewState(null)
        return
      }
      setPreviewState(data)
    })
  }

  function onConfirm() {
    const values = getValues()
    setFeedback(null)
    const sanitized: GenerateScheduleInput = {
      ...values,
      selectedDays: values.selectedDays.filter((d) => !isPastDay(d)),
    }
    startConfirm(async () => {
      const { data, error } = await clientApi.doctor.schedule.generate.post(sanitized)
      if (error) {
        const message = typeof error.value === 'object' && error.value && 'message' in error.value
          ? String((error.value as { message: unknown }).message)
          : 'No se pudo confirmar el horario'
        setFeedback({ kind: 'error', message })
        return
      }
      setFeedback({
        kind: 'success',
        message: `${data.created} horarios creados. ${data.skipped} ignorados por solapamiento.`,
      })
      setPreviewState(null)
    })
  }

  const isBusy = isPreviewing || isConfirming

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parámetros del horario</CardTitle>
          <CardDescription>
            Selecciona los días disponibles, define el rango horario y la duración de cada cita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPreviewSubmit)} className="space-y-5">
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
              <span className="font-medium">Semana seleccionada: </span>
              <span className="text-muted-foreground">
                {formatLong(monday)} – {formatLong(sunday)}
              </span>
            </div>

            <div className="space-y-2">
              <Label>Días disponibles</Label>
              <Controller
                control={control}
                name="selectedDays"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {DAYS.map((day) => {
                      const past    = isPastDay(day.value)
                      const checked = field.value.includes(day.value) && !past
                      return (
                        <label
                          key={day.value}
                          className={cn(
                            'flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm',
                            past
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer hover:bg-accent',
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={past}
                            onCheckedChange={(value) => {
                              const next = value
                                ? [...field.value, day.value]
                                : field.value.filter((v) => v !== day.value)
                              field.onChange(next)
                            }}
                          />
                          {day.label}
                        </label>
                      )
                    })}
                  </div>
                )}
              />
              {errors.selectedDays && (
                <p className="text-xs text-red-600">{errors.selectedDays.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Hora de inicio</Label>
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field }) => (
                    <TimePicker value={field.value} onChange={field.onChange} min={minStartTime} />
                  )}
                />
                {minStartTime && (
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    Mínimo hoy: {minStartTime} (30 min en el futuro)
                  </p>
                )}
                {errors.startTime && (
                  <p className="text-xs text-red-600">{errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Hora de fin</Label>
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field }) => (
                    <TimePicker value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.endTime && (
                  <p className="text-xs text-red-600">{errors.endTime.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Duración por cita</Label>
                <Controller
                  control={control}
                  name="slotDuration"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value) as 15 | 30 | 45 | 60)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Duración" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <input type="hidden" {...register('weekStartDate')} />

            <Button type="submit" disabled={isBusy}>
              {isPreviewing ? 'Calculando…' : 'Generar vista previa'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {feedback && (
        <Alert
          className={
            feedback.kind === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 text-sm p-3 rounded-md'
              : 'border-red-200 bg-red-50 text-red-800 text-sm p-3 rounded-md'
          }
        >
          {feedback.message}
        </Alert>
      )}

      {previewState && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
            <CardDescription>
              {previewState.preview.length} bloques se crearán. {previewState.conflicting.length} se ignorarán por solapamiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewState.preview.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora inicio</TableHead>
                    <TableHead>Hora fin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewState.preview.map((slot) => (
                    <TableRow key={`${slot.eventDate}-${slot.startTime}`}>
                      <TableCell className="capitalize">{formatPreviewDate(slot.eventDate)}</TableCell>
                      <TableCell>{formatTime(slot.startTime)}</TableCell>
                      <TableCell>{formatTime(slot.endTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay bloques nuevos para generar con estos parámetros.
              </p>
            )}

            <Button
              type="button"
              onClick={onConfirm}
              disabled={isBusy || previewState.preview.length === 0}
            >
              {isConfirming ? 'Confirmando…' : 'Confirmar horario'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
