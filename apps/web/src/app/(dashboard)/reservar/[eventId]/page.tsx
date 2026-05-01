import { ReservarCitaPage } from '@/views/reservar-cita'

export const metadata = { title: 'Confirmar cita' }

export default async function ReservarCitaRoute({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  return <ReservarCitaPage eventId={eventId} />
}
