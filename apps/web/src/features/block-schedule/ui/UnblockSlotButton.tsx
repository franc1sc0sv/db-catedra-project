'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'

interface UnblockSlotButtonProps {
  slotId: string
}

export function UnblockSlotButton({ slotId }: UnblockSlotButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function onClick() {
    setError(null)
    setSubmitting(true)
    try {
      const { error: apiError } = await clientApi['schedule-events']({ id: slotId }).delete()
      if (apiError) {
        const message = typeof apiError.value === 'object' && apiError.value && 'message' in apiError.value
          ? String((apiError.value as { message: unknown }).message)
          : 'No se pudo desbloquear'
        setError(message)
        return
      }
      startTransition(() => router.refresh())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={submitting || isPending}
      >
        {submitting ? 'Desbloqueando…' : 'Desbloquear'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
