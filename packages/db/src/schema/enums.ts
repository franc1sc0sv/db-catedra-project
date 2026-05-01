import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', [
  'doctor', 'patient', 'receptionist',
])

export const accountStatusEnum = pgEnum('account_status', [
  'active', 'inactive', 'suspended',
])

export const bloodTypeEnum = pgEnum('blood_type', [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
])

export const messageTypeEnum = pgEnum('message_type', [
  'confirmation', 'reminder', 'cancellation', 'rescheduling',
])

export const deliveryStatusEnum = pgEnum('delivery_status', [
  'sent', 'delivered', 'read', 'failed',
])

export const eventTypeEnum = pgEnum('event_type', [
  'appointment', 'block', 'vacation', 'meeting',
])

export const availabilityStatusEnum = pgEnum('availability_status', [
  'available', 'busy', 'blocked', 'completed', 'cancelled',
])

export const syncStatusEnum = pgEnum('sync_status', [
  'pending', 'synced', 'error',
])

export const coverageTypeEnum = pgEnum('coverage_type', [
  'basic', 'complete', 'dental', 'vision', 'comprehensive',
])

export type UserRole           = (typeof userRoleEnum.enumValues)[number]
export type AccountStatus      = (typeof accountStatusEnum.enumValues)[number]
export type BloodType          = (typeof bloodTypeEnum.enumValues)[number]
export type MessageType        = (typeof messageTypeEnum.enumValues)[number]
export type DeliveryStatus     = (typeof deliveryStatusEnum.enumValues)[number]
export type EventType          = (typeof eventTypeEnum.enumValues)[number]
export type AvailabilityStatus = (typeof availabilityStatusEnum.enumValues)[number]
export type SyncStatus         = (typeof syncStatusEnum.enumValues)[number]
export type CoverageType       = (typeof coverageTypeEnum.enumValues)[number]
