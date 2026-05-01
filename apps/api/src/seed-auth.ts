import { eq } from 'drizzle-orm'
import { auth } from '@project/auth/src/auth'
import { db } from '@project/db/src/client'
import { Users } from '@project/db/src/schema/iam.schema'

type Seed = {
  email: string
  name: string
  role: 'doctor' | 'patient' | 'receptionist'
}

const DEFAULT_PASSWORD = 'password123'

const seeds: Seed[] = [
  { email: 'doctora.lopez@clinic.com', name: 'Dra. Ana López',     role: 'doctor' },
  { email: 'doctor.perez@clinic.com',  name: 'Dr. Luis Pérez',     role: 'doctor' },
  { email: 'recep1@clinic.com',        name: 'Receptionist One',   role: 'receptionist' },
  { email: 'paciente1@clinic.com',     name: 'Paciente Uno',       role: 'patient' },
  { email: 'paciente2@clinic.com',     name: 'Paciente Dos',       role: 'patient' },
]

async function main() {
  for (const seed of seeds) {
    const existing = await db.query.Users.findFirst({ where: eq(Users.email, seed.email) })
    if (existing) {
      console.log(`skip ${seed.email} (already exists)`)
      continue
    }

    await auth.api.signUpEmail({
      body: {
        email:    seed.email,
        name:     seed.name,
        password: DEFAULT_PASSWORD,
      },
    })

    await db.update(Users).set({ role: seed.role }).where(eq(Users.email, seed.email))
    console.log(`seeded ${seed.email} (${seed.role})`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
