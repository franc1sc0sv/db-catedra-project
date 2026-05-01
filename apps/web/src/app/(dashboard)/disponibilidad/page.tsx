import { DisponibilidadPage } from '@/views/disponibilidad'

export const dynamic = 'force-dynamic'

export default async function DisponibilidadRoute({
  searchParams,
}: {
  searchParams: Promise<{ doctor_id?: string; week?: string }>
}) {
  const { doctor_id, week } = await searchParams
  return <DisponibilidadPage doctorId={doctor_id} week={week} />
}