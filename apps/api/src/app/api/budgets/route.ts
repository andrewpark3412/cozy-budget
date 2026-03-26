import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { budgets, budgetItems } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { createBudgetSchema } from '@cozy-budget/shared'

// GET /api/budgets?month=&year=
// Returns the budget for the given month/year, creating it if it doesn't exist.
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = req.nextUrl
  const month = parseInt(searchParams.get('month') ?? '', 10)
  const year = parseInt(searchParams.get('year') ?? '', 10)

  if (!month || !year || month < 1 || month > 12 || year < 2020) {
    return NextResponse.json(
      { data: null, error: 'Valid month (1–12) and year are required' },
      { status: 400 },
    )
  }

  let budget = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, auth.userId),
      eq(budgets.month, month),
      eq(budgets.year, year),
    ),
    with: {
      items: {
        with: { category: true, transactions: true },
      },
    },
  })

  // Auto-create budget for the month if it doesn't exist
  if (!budget) {
    const [created] = await db
      .insert(budgets)
      .values({ userId: auth.userId, month, year })
      .returning()

    budget = { ...created!, items: [] }
  }

  return NextResponse.json({ data: budget, error: null })
}
