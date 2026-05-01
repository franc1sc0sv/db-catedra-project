'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserX } from 'lucide-react'
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
import { Alert } from '@/components/ui/alert'

interface DeactivateUserButtonProps {
  userId:   string
  userName: string
}

export function DeactivateUserButton({ userId, userName }: DeactivateUserButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleDeactivate() {
    setError(null)
    const { error: apiError } = await clientApi.users({ id: userId }).deactivate.post()
    if (apiError) {
      const value = apiError.value
      const message =
        value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
          ? value.message
          : 'No se pudo desactivar el usuario'
      setError(message)
      return
    }
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <UserX className="h-3.5 w-3.5" />
            Desactivar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Desactivar usuario</DialogTitle>
          <DialogDescription>
            ¿Seguro que deseas desactivar a <strong>{userName}</strong>? No podrá iniciar sesión.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="text-sm">
            {error}
          </Alert>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDeactivate} disabled={pending}>
            {pending ? 'Desactivando…' : 'Desactivar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
