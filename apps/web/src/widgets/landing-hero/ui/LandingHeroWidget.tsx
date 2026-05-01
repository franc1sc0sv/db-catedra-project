import Link from 'next/link'
import { Stethoscope } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LandingHeroWidget() {
  return (
    <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
        <Stethoscope className="h-7 w-7" />
      </div>
      <div className="flex flex-col items-center gap-5 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Medical Management System
        </span>
        <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Healthcare,{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            simplified.
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Manage patients, appointments, and medical records from a single platform — built for every role in your clinic.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/login" className={cn(buttonVariants({ size: 'lg' }))}>
          Sign in
        </Link>
        <Link href="/register" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}>
          Create account
        </Link>
      </div>
    </section>
  )
}
