import { pgTable, uuid, date, time, varchar, index } from 'drizzle-orm/pg-core'
import { eventTypeEnum, availabilityStatusEnum, syncStatusEnum } from './enums'
import { Users } from './iam.schema'

export const ScheduleEvents = pgTable('ScheduleEvents', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  doctorId:           uuid('doctorId').notNull().references(() => Users.id),
  eventDate:          date('eventDate').notNull(),
  startTime:          time('startTime').notNull(),
  endTime:            time('endTime').notNull(),
  eventType:          eventTypeEnum('eventType').notNull(),
  availabilityStatus: availabilityStatusEnum('availabilityStatus').notNull().default('available'),
  googleEventId:      varchar('googleEventId', { length: 255 }),
  googleHtmlLink:     varchar('googleHtmlLink', { length: 500 }),
  syncStatus:         syncStatusEnum('syncStatus').notNull().default('pending'),
  auditUserId:        uuid('auditUserId').references(() => Users.id),
}, (t) => [
  index('schedule_events_audit_user_id_idx').on(t.auditUserId),
  index('schedule_events_doctor_date_idx').on(t.doctorId, t.eventDate),
])

export type ScheduleEvent    = typeof ScheduleEvents.$inferSelect
export type NewScheduleEvent = typeof ScheduleEvents.$inferInsert
