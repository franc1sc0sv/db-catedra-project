import { z } from 'zod'

export const completeProfileSchema = z.object({
  firstName:   z.string().min(1, 'Requerido'),
  lastName:    z.string().min(1, 'Requerido'),
  dui:         z.string().length(9, 'DUI debe tener exactamente 9 caracteres'),
  birthDate:   z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida'),
  whatsapp:    z.string().min(8, 'WhatsApp requerido'),
insuranceId: z.string().uuid().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
})

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>
