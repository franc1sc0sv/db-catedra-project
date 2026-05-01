import { notFound } from 'next/navigation'
import { createServerApi } from '@/shared/api/server'
import { requireAuth } from '@/shared/auth/guards.server'
import { ReservarCitaForm } from '@/features/booking'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ReservarCitaPageProps {
  eventId: string
}

export async function ReservarCitaPage({ eventId }: ReservarCitaPageProps) {
  await requireAuth()

  const api = await createServerApi()
  const { data: slot, error } = await (api as any)['schedule-events'][eventId].get()
  if (error || !slot) {
    notFound()
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Confirmar cita</CardTitle>
        <CardDescription>Revisa los datos y describe el motivo de tu consulta.</CardDescription>
      </CardHeader>
      <CardContent>
        <ReservarCitaForm slot={slot} />
      </CardContent>
    </Card>
  )
}
