import { CalendarDays, ClipboardList, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/entities/user'

interface ReceptionistDashboardPageProps {
  user: User
}

export function ReceptionistDashboardPage({ user }: ReceptionistDashboardPageProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reception</p>
        <h1>Reception Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.email}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} title="Today's Schedule" value="—" tone="primary" />
        <StatCard icon={ClipboardList} title="Pending Check-ins" value="—" tone="warning" />
        <StatCard icon={MessageCircle} title="New Messages" value="—" tone="secondary" />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  tone,
}: {
  icon: typeof MessageCircle
  title: string
  value: string
  tone: 'primary' | 'secondary' | 'warning'
}) {
  const toneClass = {
    primary:   'bg-primary/10 text-primary',
    secondary: 'bg-secondary/15 text-secondary',
    warning:   'bg-warning/20 text-warning-foreground',
  }[tone]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-bold mt-1">{value}</CardTitle>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
