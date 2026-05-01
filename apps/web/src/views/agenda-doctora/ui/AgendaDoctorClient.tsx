'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/shared/api/client'
import { AgendaTimelineWidget, type AgendaItem } from '@/widgets/agenda-timeline'
import { Alert } from '@/components/ui/alert'

interface AgendaDoctorClientProps {
  fecha: string
}

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; items: AgendaItem[] }

export function AgendaDoctorClient({ fecha }: AgendaDoctorClientProps) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ kind: 'loading' })
    ;(async () => {
      const { data, error } = await clientApi.doctor.agenda.get({ query: { fecha } })
      if (cancelled) return
      if (error) {
        const value = error.value
        const message =
          value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
            ? value.message
            : 'No se pudo cargar la agenda.'
        setState({ kind: 'error', message })
        return
      }
      setState({ kind: 'success', items: Array.isArray(data) ? (data as AgendaItem[]) : [] })
    })()
    return () => { cancelled = true }
  }, [fecha])

  if (state.kind === 'loading') {
    return (
      <p className="text-sm italic text-muted-foreground">Cargando agenda…</p>
    )
  }
  if (state.kind === 'error') {
    return (
      <Alert variant="destructive" className="text-sm">{state.message}</Alert>
    )
  }
  return <AgendaTimelineWidget items={state.items} fecha={fecha} />
}
