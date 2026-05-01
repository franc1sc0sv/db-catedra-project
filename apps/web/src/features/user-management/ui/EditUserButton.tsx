'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { UserRole } from '@project/enums/src/user-role.enum'
import type { UserOutput } from '@project/api/src/modules/users/application/dtos/outputs/user.output'
import type { UpdateUserInput } from '@project/api/src/modules/users/application/dtos/inputs/update-user.input'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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

interface EditUserButtonProps {
  user: UserOutput
}

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: UserRole.Doctor,       label: 'Doctor' },
  { value: UserRole.Receptionist, label: 'Recepcionista' },
  { value: UserRole.Patient,      label: 'Paciente' },
]

export function EditUserButton({ user }: EditUserButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<UpdateUserInput>({
    defaultValues: { name: user.name, role: user.role },
  })
  const role = watch('role')

  async function onSubmit(values: UpdateUserInput) {
    setServerError(null)
    const { error } = await clientApi.users({ id: user.id }).patch(values)
    if (error) {
      const value = error.value
      const message =
        value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
          ? value.message
          : 'No se pudo actualizar el usuario'
      setServerError(message)
      return
    }
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar {user.email}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {serverError && (
            <Alert variant="destructive" className="text-sm">
              {serverError}
            </Alert>
          )}
          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register('name')} />
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
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
