import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema/index'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
export type DbClient = typeof db
export type TxClient = Parameters<Parameters<typeof db.transaction>[0]>[0]
