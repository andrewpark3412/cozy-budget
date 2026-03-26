import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { budgets, budgetItems } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { copyBudgetSchema } from '@cozy-budget/shared'

// POST /api/budgets/:id/copy
// Copies budget items from a source month into an existing budget.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const body = await parseBody(req, copyBudgetSchema)
  if (body instanceof NextResponse) return body

  // Verify the target budget belongs to the user
  const targetBudget = await db.query.budgets.findFirst({
    where: and(eq(budgets.id, id), eq(budgets.userId, auth.userId)),
  })

  if (!targetBudget) {
    return NextResponse.json({ data: null, error: 'Budget not found' }, { status: 404 })
  }

  // Find the source budget
  const sourceBudget = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, auth.userId),
      eq(budgets.month, body.sourceMonth),
      eq(budgets.year, body.sourceYear),
    ),
    with: { items: true },
  })

  if (!sourceBudget) {
    return NextResponse.json(
      { data: null, error: 'Source budget not found' },
      { status: 404 },
    )
  }

  if (sourceBudget.items.length === 0) {
    return NextResponse.json(
      { data: null, error: 'Source budget has no items to copy' },
      { status: 400 },
    )
  }

  // Remove existing items from the target budget before copying
  await db.delete(budgetItems).where(eq(budgetItems.budgetId, id))

  // Copy items (planned amounts only — no transactions)
  const newItems = sourceBudget.items.map((item) => ({
    budgetId: id,
    categoryId: item.categoryId,
    plannedAmount: item.plannedAmount,
  }))

  await db.insert(budgetItems).values(newItems)

  // Return the updated budget with items
  const updated = await db.query.budgets.findFirst({
    where: eq(budgets.id, id),
    with: { items: { with: { category: true, transactions: true } } },
  })

  return NextResponse.json({ data: updated, error: null })
}
