'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  Users,
  UserCog,
} from 'lucide-react'
import { SignOutButton } from '@/features/auth'
import type { User } from '@/entities/user'
import { cn } from '@/lib/utils'

type NavLink = { href: string; label: string; icon: typeof LayoutDashboard }

const NAV_LINKS: Record<string, NavLink[]> = {
  doctor: [
    { href: '/dashboard/doctor',          label: 'Dashboard',           icon: LayoutDashboard },
    { href: '/dashboard/doctor/agenda',   label: 'Agenda de hoy',       icon: CalendarDays },
    { href: '/dashboard/doctor/horarios', label: 'Configurar horarios', icon: CalendarClock },
    { href: '/dashboard/doctor/usuarios', label: 'Usuarios',            icon: UserCog },
  ],
  patient: [
    { href: '/dashboard/patient', label: 'Dashboard',          icon: LayoutDashboard },
    { href: '/disponibilidad',    label: 'Ver disponibilidad', icon: CalendarClock },
    { href: '/mis-citas',         label: 'Mis citas',          icon: ClipboardList },
  ],
  receptionist: [
    { href: '/dashboard/receptionist', label: 'Dashboard',     icon: LayoutDashboard },
    { href: '/agenda',                 label: 'Agenda diaria', icon: CalendarDays },
  ],
}

const ROLE_LABELS: Record<string, string> = {
  doctor:       'Doctor',
  patient:      'Patient',
  receptionist: 'Receptionist',
}

const ROLE_ICONS: Record<string, typeof LayoutDashboard> = {
  doctor:       Stethoscope,
  patient:      Activity,
  receptionist: Users,
}

interface DashboardNavWidgetProps {
  user: User
}

export function DashboardNavWidget({ user }: DashboardNavWidgetProps) {
  const pathname = usePathname()
  const links = NAV_LINKS[user.role] ?? []
  const RoleIcon = ROLE_ICONS[user.role] ?? Users

  const activeHref = links
    .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-heading font-bold tracking-tight">MediSystem</p>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/70">
            Healthcare platform
          </p>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary-foreground">
            <RoleIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.email}</p>
            <p className="text-[11px] text-sidebar-foreground/70">
              {ROLE_LABELS[user.role] ?? user.role}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <SignOutButton />
      </div>
    </aside>
  )
}
