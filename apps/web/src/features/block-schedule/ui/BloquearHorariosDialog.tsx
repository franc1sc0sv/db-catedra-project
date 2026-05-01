'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BloquearHorariosForm } from './BloquearHorariosForm'

interface BloquearHorariosDialogProps {
  doctorId: string
}

export function BloquearHorariosDialog({ doctorId }: BloquearHorariosDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Bloquear franja</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bloquear franja</DialogTitle>
          <DialogDescription>
            Marca un rango horario como no disponible para los pacientes.
          </DialogDescription>
        </DialogHeader>
        <BloquearHorariosForm
          doctorId={doctorId}
          onSuccess={() => {
            setOpen(false)
            startTransition(() => router.refresh())
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
