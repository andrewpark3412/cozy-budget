/**
 * Seed script — run once to insert predefined categories.
 * Usage: pnpm --filter @cozy-budget/api db:seed
 */
import 'dotenv/config'
import { db } from './index'
import { categories } from './schema'
import { PREDEFINED_CATEGORIES } from '@cozy-budget/shared'

async function seed() {
  console.log('Seeding predefined categories...')

  for (const cat of PREDEFINED_CATEGORIES) {
    await db
      .insert(categories)
      .values({
        userId: null,
        name: cat.name,
        type: cat.type,
        isSystem: cat.isSystem,
        sortOrder: cat.sortOrder,
      })
      .onConflictDoNothing()
  }

  console.log(`Inserted ${PREDEFINED_CATEGORIES.length} categories.`)
  process.exit(0)
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
