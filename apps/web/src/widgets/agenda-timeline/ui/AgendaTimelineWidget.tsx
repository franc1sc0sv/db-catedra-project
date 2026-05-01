'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { AgendaItemOutput } from '@project/api/src/modules/doctor-agenda/application/dtos/outputs/agenda-item.output'
import { clientApi } from '@/shared/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

type AgendaStatus = AgendaItemOutput['status']

export type AgendaItem = AgendaItemOutput

interface AgendaTimelineWidgetProps {
  items: AgendaItem[]
  fecha: string
}

const STATUS_LABEL: Record<AgendaStatus, string> = {
  disponible: 'Disponible',
  reservado:  'Reservado',
  completado: 'Completado',
  cancelado:  'Cancelado',
}

const STATUS_STYLES: Record<AgendaStatus, { card: string; badge: string; stripe: string }> = {
  disponible: {
    card:   'bg-muted/40 border-border',
    badge:  'bg-muted text-muted-foreground',
    stripe: 'bg-border',
  },
  reservado: {
    card:   'bg-primary/5 border-primary/30',
    badge:  'bg-primary/15 text-primary',
    stripe: 'bg-primary',
  },
  completado: {
    card:   'bg-success/10 border-success/30',
    badge:  'bg-success/20 text-success',
    stripe: 'bg-success',
  },
  cancelado: {
    card:   'bg-destructive/10 border-destructive/30',
    badge:  'bg-destructive/15 text-destructive',
    stripe: 'bg-destructive',
  },
}

function shiftDate(fecha: string, days: number): string {
  const date = new Date(`${fecha}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatLongDate(fecha: string): string {
  return new Date(`${fecha}T00:00:00.000Z`).toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

function SlotCard({ item, fecha, onBlocked }: { item: AgendaItem; fecha: string; onBlocked: (slotId: string) => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const style = STATUS_STYLES[item.status]
  const isFree = item.status === 'disponible'

  function handleBlock() {
    setError(null)
    startTransition(async () => {
      const { error: err } = await clientApi.doctor['block-slot'].post({
        fecha,
        start: item.startTime,
        end:   item.endTime,
      })
      if (err) {
        const val = err.value
        const msg = val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
          ? val.message
          : 'No se pudo bloquear el horario.'
        setError(msg)
        return
      }
      onBlocked(item.slotId)
    })
  }

  return (
    <li key={item.slotId}>
      <Card className={cn('flex flex-row gap-0 border py-0', style.card)}>
        <span aria-hidden className={cn('w-1.5 shrink-0 self-stretch rounded-l-xl', style.stripe)} />
        <CardContent className="flex w-full flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-sm text-muted-foreground">
              {formatTime(item.startTime)} – {formatTime(item.endTime)}
            </p>
            {isFree ? (
              <p className="text-sm italic text-muted-foreground">Cupo disponible</p>
            ) : (
              <div className="space-y-0.5">
                <p className="text-base font-semibold">
                  {item.patientName ?? 'Paciente sin nombre'}
                </p>
                {item.bookingReason && (
                  <p className="text-sm text-muted-foreground">{item.bookingReason}</p>
                )}
                {item.status === 'completado' && item.mainDiagnosis && (
                  <p className="text-sm italic text-success">
                    Diagnóstico: {item.mainDiagnosis}
                  </p>
                )}
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', style.badge)}>
              {STATUS_LABEL[item.status]}
            </span>
            {isFree && (
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleBlock}
              >
                {isPending ? 'Bloqueando…' : 'Bloquear'}
              </Button>
            )}
            {!isFree && item.status !== 'disponible' && (
              <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'pointer-events-none opacity-60')}>
                Ver historial
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  )
}

export function AgendaTimelineWidget({ items: initialItems, fecha }: AgendaTimelineWidgetProps) {
  const [items, setItems] = useState<AgendaItem[]>(initialItems)
  const previous = shiftDate(fecha, -1)
  const next     = shiftDate(fecha, +1)

  function handleBlocked(slotId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.slotId === slotId ? { ...item, status: 'cancelado' as AgendaStatus } : item
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold capitalize">{formatLongDate(fecha)}</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'bloque' : 'bloques'} en agenda
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={{ query: { fecha: previous } }} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            ← Anterior
          </Link>
          <Link href={{ query: { fecha: next } }} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Siguiente →
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-6 text-center text-sm italic text-muted-foreground">
              No hay bloques programados para este día.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <SlotCard key={item.slotId} item={item} fecha={fecha} onBlocked={handleBlocked} />
          ))}
        </ol>
      )}
    </div>
  )
}