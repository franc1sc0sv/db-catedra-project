'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DateNavProps {
  fecha:    string
  doctorId: string
}

function shiftDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function DateNav({ fecha, doctorId }: DateNavProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (next: string) => {
    startTransition(() => {
      router.push(`/agenda?doctor_id=${doctorId}&fecha=${next}`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(shiftDate(fecha, -1))}
        disabled={isPending}
      >
        Día anterior
      </Button>
      <Input
        type="date"
        value={fecha}
        onChange={(e) => {
          const next = e.target.value
          if (next) navigate(next)
        }}
        className="w-44"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(shiftDate(fecha, 1))}
        disabled={isPending}
      >
        Día siguiente
      </Button>
    </div>
  )
}
