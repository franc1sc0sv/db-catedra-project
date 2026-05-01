import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { applyTriggers } from './schema/triggers'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const db = drizzle(pool)

  try {
    console.log('Running migrations...')
    await migrate(db, { migrationsFolder: './src/migrations' })

    console.log('Applying triggers...')
    await applyTriggers(db)

    console.log('Done.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
