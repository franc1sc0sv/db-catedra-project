import { Stethoscope } from 'lucide-react'

export default function CompleteProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted to-accent/40 px-4 py-10">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
          <Stethoscope className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">MediSystem</p>
      </div>
      {children}
    </div>
  )
}
