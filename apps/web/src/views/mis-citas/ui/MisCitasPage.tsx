import { redirect } from 'next/navigation'
import { createServerApi } from '@/shared/api/server'
import { requireAuth } from '@/shared/auth/guards.server'
import { AppointmentListWidgetCard } from '@/widgets/appointment-list'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface MisCitasPageProps {
  page?: string
}

export async function MisCitasPage({ page: pageParam }: MisCitasPageProps) {
  await requireAuth()

  const api = await createServerApi()
  const { data, error } = await api.appointments.my.get({
    query: { page: pageParam ?? '1', pageSize: '10' },
  })

  if (error) {
    if (error.status === 422) {
      redirect('/complete-profile')
    }
    return (
      <Card className="w-full">
        <CardContent>
          <Alert variant="destructive" className="text-sm">
            No se pudieron cargar tus citas. Intenta de nuevo más tarde.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return <AppointmentListWidgetCard upcoming={data.upcoming} past={data.past} />
}
