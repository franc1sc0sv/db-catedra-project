import { AgendaDoctorPage } from '@/views/agenda-doctora'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default async function AgendaRoute({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const { fecha } = await searchParams
  const fechaFinal = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : todayIso()
  return <AgendaDoctorPage fecha={fechaFinal} />
}
