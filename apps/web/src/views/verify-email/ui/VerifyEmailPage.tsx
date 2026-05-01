'use client'

import { useState } from 'react'
import { authClient } from '@/shared/auth/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface VerifyEmailPageProps {
  email: string
}

export function VerifyEmailPage({ email }: VerifyEmailPageProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function resend() {
    setStatus('sending')
    setErrorMessage(null)
    const { error } = await authClient.sendVerificationEmail({ email })
    if (error) {
      setStatus('error')
      setErrorMessage(error.message ?? 'No se pudo reenviar el correo. Intenta más tarde.')
      return
    }
    setStatus('sent')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Verifica tu correo</CardTitle>
        <CardDescription>
          Te enviamos un enlace de verificación a <strong>{email}</strong>. Haz clic en él para
          continuar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'sent' && (
          <Alert className="text-sm border-green-200 bg-green-50 text-green-800">
            Correo reenviado. Revisa tu bandeja de entrada.
          </Alert>
        )}
        {status === 'error' && errorMessage && (
          <Alert variant="destructive" className="text-sm">
            {errorMessage}
          </Alert>
        )}
        <Button onClick={resend} disabled={status === 'sending'} className="w-full">
          {status === 'sending' ? 'Enviando…' : 'Reenviar correo'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          ¿Ya verificaste tu correo? Recarga esta página para continuar.
        </p>
      </CardContent>
    </Card>
  )
}
