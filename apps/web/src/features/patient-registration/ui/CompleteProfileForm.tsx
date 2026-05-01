'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientApi } from '@/shared/api/client'
import { completeProfileSchema, type CompleteProfileValues } from '@/entities/patient'
import type { InsuranceOutput } from '@project/api/src/modules/patients/application/dtos/outputs/insurance.output'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

export type InsuranceOption = InsuranceOutput

interface CompleteProfileFormProps {
  insurances: InsuranceOutput[]
}

export function CompleteProfileForm({ insurances }: CompleteProfileFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
  })

  async function onSubmit(values: CompleteProfileValues) {
    setServerError(null)
    const { error } = await clientApi.patients['complete-profile'].post({
      firstName:   values.firstName,
      lastName:    values.lastName,
      dui:         values.dui,
      birthDate:   values.birthDate,
      whatsapp:    values.whatsapp,
      insuranceId: values.insuranceId ?? null,
    })
    if (error) {
      const value = error.value
      const message =
        value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
          ? value.message
          : 'No se pudo guardar tu perfil. Intenta de nuevo.'
      setServerError(message)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5">Paso 2</span>
        <span>Completa tu información personal</span>
      </div>

      {serverError && (
        <Alert variant="destructive" className="text-sm">
          {serverError}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName">Nombres</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Apellidos</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="dui">DUI (9 caracteres)</Label>
        <Input id="dui" maxLength={9} placeholder="012345678" {...register('dui')} />
        {errors.dui && <p className="text-xs text-red-600">{errors.dui.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="birthDate">Fecha de nacimiento</Label>
          <Input id="birthDate" type="date" {...register('birthDate')} />
          {errors.birthDate && <p className="text-xs text-red-600">{errors.birthDate.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" placeholder="+50370000000" {...register('whatsapp')} />
          {errors.whatsapp && <p className="text-xs text-red-600">{errors.whatsapp.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="insuranceId">Aseguradora (opcional)</Label>
        <select
          id="insuranceId"
          {...register('insuranceId')}
          className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
          defaultValue=""
        >
          <option value="">Sin aseguradora</option>
          {insurances.map((ins) => (
            <option key={ins.id} value={ins.id}>
              {ins.insurerName} — {ins.coverageType}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : 'Guardar perfil'}
      </Button>
    </form>
  )
}
