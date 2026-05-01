import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core'
import { messageTypeEnum, deliveryStatusEnum } from './enums'
import { MedicalAppointments } from './medical-appointments.schema'

export const WhatsAppMessages = pgTable('WhatsAppMessages', {
  id:                uuid('id').primaryKey().defaultRandom(),
  appointmentId:     uuid('appointmentId').notNull()
                       .references(() => MedicalAppointments.id),
  destinationPhone:  varchar('destinationPhone', { length: 20 }).notNull(),
  messageType:       messageTypeEnum('messageType').notNull(),
  messageBody:       varchar('messageBody', { length: 1000 }).notNull(),
  sentAt:            timestamp('sentAt').notNull().defaultNow(),
  deliveryStatus:    deliveryStatusEnum('deliveryStatus').notNull().default('sent'),
  whatsappMessageId: varchar('whatsappMessageId', { length: 255 }),
}, (t) => [
  index('whatsapp_messages_appointment_id_idx').on(t.appointmentId),
])

export type WhatsAppMessage    = typeof WhatsAppMessages.$inferSelect
export type NewWhatsAppMessage = typeof WhatsAppMessages.$inferInsert
