import { AgendaSecretariaPage } from '@/views/agenda-secretaria'

interface PageProps {
  searchParams: Promise<{ doctor_id?: string; fecha?: string }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const { doctor_id, fecha } = await searchParams
  const today = new Date().toISOString().slice(0, 10)
  return <AgendaSecretariaPage doctorId={doctor_id} fecha={fecha ?? today} />
}
