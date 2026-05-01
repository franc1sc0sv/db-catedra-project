import { CalendarDays, ClipboardList, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/entities/user'

interface DoctorDashboardPageProps {
  user: User
}

export function DoctorDashboardPage({ user }: DoctorDashboardPageProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
        <h1>Doctor Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.email}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} title="Today's Appointments" value="—" tone="primary" />
        <StatCard icon={Stethoscope} title="My Patients" value="—" tone="secondary" />
        <StatCard icon={ClipboardList} title="Pending Records" value="—" tone="warning" />
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
  icon: typeof Stethoscope
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
