'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/shared/auth/client'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleSignOut}
      className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  )
}
