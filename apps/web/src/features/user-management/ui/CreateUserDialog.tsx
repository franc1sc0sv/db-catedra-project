'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { UserRole } from '@project/enums/src/user-role.enum'
import type { CreateUserInput } from '@project/api/src/modules/users/application/dtos/inputs/create-user.input'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: UserRole.Doctor,       label: 'Doctor' },
  { value: UserRole.Receptionist, label: 'Recepcionista' },
  { value: UserRole.Patient,      label: 'Paciente' },
]

export function CreateUserDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    defaultValues: { role: UserRole.Patient },
  })

  const role = watch('role')

  async function onSubmit(values: CreateUserInput) {
    setServerError(null)
    const { error } = await clientApi.users.create.post(values)
    if (error) {
      const value = error.value
      const message =
        value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
          ? value.message
          : 'No se pudo crear el usuario'
      setServerError(message)
      return
    }
    reset()
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>
            Registra una cuenta nueva con su rol asignado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {serverError && (
            <Alert variant="destructive" className="text-sm">
              {serverError}
            </Alert>
          )}
          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register('name', { required: 'Requerido' })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Requerido' })} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Rol</Label>
            <Select value={role} onValueChange={(v) => setValue('role', v as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando…' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
