import Link from 'next/link'
import { LoginForm } from '@/features/auth'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage({ registered = false }: { registered?: boolean }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your MediSystem account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {registered && (
          <Alert className="border-success/30 bg-success/10 text-sm">
            <p className="text-foreground">Account created. Sign in with your credentials.</p>
          </Alert>
        )}
        <LoginForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary underline underline-offset-4">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
