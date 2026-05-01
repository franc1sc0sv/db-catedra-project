import { pgTable, uuid, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { userRoleEnum, accountStatusEnum } from './enums'

export const Users = pgTable('Users', {
  id:            uuid('id').primaryKey().defaultRandom(),
  name:          varchar('name', { length: 255 }).notNull().default(''),
  email:         varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image:         text('image'),
  role:          userRoleEnum('role').notNull().default('patient'),
  accountStatus: accountStatusEnum('accountStatus').notNull().default('active'),
  createdAt:     timestamp('createdAt').notNull().defaultNow(),
  updatedAt:     timestamp('updatedAt').notNull().defaultNow(),
})

export const Sessions = pgTable('Sessions', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp('expiresAt').notNull(),
  token:     text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId:    uuid('userId').notNull().references(() => Users.id, { onDelete: 'cascade' }),
}, (t) => [
  index('sessions_user_id_idx').on(t.userId),
])

export const Accounts = pgTable('Accounts', {
  id:                    text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  accountId:             text('accountId').notNull(),
  providerId:            text('providerId').notNull(),
  userId:                uuid('userId').notNull().references(() => Users.id, { onDelete: 'cascade' }),
  accessToken:           text('accessToken'),
  refreshToken:          text('refreshToken'),
  idToken:               text('idToken'),
  accessTokenExpiresAt:  timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope:                 text('scope'),
  password:              text('password'),
  createdAt:             timestamp('createdAt').notNull().defaultNow(),
  updatedAt:             timestamp('updatedAt').notNull().defaultNow(),
}, (t) => [
  index('accounts_user_id_idx').on(t.userId),
])

export const Verifications = pgTable('Verifications', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expiresAt').notNull(),
  createdAt:  timestamp('createdAt'),
  updatedAt:  timestamp('updatedAt'),
}, (t) => [
  index('verifications_identifier_idx').on(t.identifier),
])

export type User            = typeof Users.$inferSelect
export type NewUser         = typeof Users.$inferInsert
export type Session         = typeof Sessions.$inferSelect
export type NewSession      = typeof Sessions.$inferInsert
export type Account         = typeof Accounts.$inferSelect
export type NewAccount      = typeof Accounts.$inferInsert
export type Verification    = typeof Verifications.$inferSelect
export type NewVerification = typeof Verifications.$inferInsert
