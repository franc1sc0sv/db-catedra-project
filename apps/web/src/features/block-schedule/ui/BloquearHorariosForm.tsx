'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientApi } from '@/shared/api/client'
import { createBlockInputSchema, type CreateBlockInput } from '@/entities/schedule-event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BloquearHorariosFormProps {
  doctorId:   string
  onSuccess?: () => void
  onCancel?:  () => void
}

const BLOCK_TYPE_OPTIONS: Array<{ value: CreateBlockInput['blockType']; label: string }> = [
  { value: 'meeting',  label: 'Reunión' },
  { value: 'vacation', label: 'Vacaciones' },
  { value: 'block',    label: 'Bloqueo general' },
]

export function BloquearHorariosForm({ doctorId, onSuccess, onCancel }: BloquearHorariosFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateBlockInput>({
    resolver: zodResolver(createBlockInputSchema),
    defaultValues: {
      date:      new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime:   '10:00',
      blockType: 'block',
    },
  })

  async function onSubmit(values: CreateBlockInput) {
    setServerError(null)
    setSubmitting(true)
    try {
      const { error } = await clientApi['schedule-events'].block.post({ ...values, doctorId })
      if (error) {
        const message = typeof error.value === 'object' && error.value && 'message' in error.value
          ? String((error.value as { message: unknown }).message)
          : 'No se pudo crear el bloqueo'
        setServerError(message)
        return
      }
      onSuccess?.()
    } catch {
      setServerError('No se pudo conectar con el servidor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert className="border-red-200 bg-red-50 text-red-800 text-sm p-3 rounded-md">
          {serverError}
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && (
          <p className="text-xs text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="startTime">Hora inicio</Label>
          <Input id="startTime" type="time" step={60 * 30} {...register('startTime')} />
          {errors.startTime && (
            <p className="text-xs text-red-600">{errors.startTime.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="endTime">Hora fin</Label>
          <Input id="endTime" type="time" step={60 * 30} {...register('endTime')} />
          {errors.endTime && (
            <p className="text-xs text-red-600">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="blockType">Tipo de bloqueo</Label>
        <Controller
          control={control}
          name="blockType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="blockType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.blockType && (
          <p className="text-xs text-red-600">{errors.blockType.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Bloquear franja'}
        </Button>
      </div>
    </form>
  )
}
