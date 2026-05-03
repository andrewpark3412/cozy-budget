import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { budgets, budgetItems } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { applyRecurringToBudget } from '@/lib/applyRecurring'
import { createBudgetItemSchema } from '@cozy-budget/shared'

// GET /api/budgets/:id/items
// Lists all budget items (with category + transactions) for a budget
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // Verify budget ownership
  const budget = await db.query.budgets.findFirst({
    where: and(eq(budgets.id, id), eq(budgets.userId, auth.userId)),
  })
  if (!budget) {
    return NextResponse.json({ data: null, error: 'Budget not found' }, { status: 404 })
  }

  const items = await db.query.budgetItems.findMany({
    where: eq(budgetItems.budgetId, id),
    with: { category: true, transactions: true },
  })

  return NextResponse.json({ data: items, error: null })
}

// POST /api/budgets/:id/items
// Adds a new budget item to a budget
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const budget = await db.query.budgets.findFirst({
    where: and(eq(budgets.id, id), eq(budgets.userId, auth.userId)),
  })
  if (!budget) {
    return NextResponse.json({ data: null, error: 'Budget not found' }, { status: 404 })
  }

  const body = await parseBody(req, createBudgetItemSchema)
  if (body instanceof NextResponse) return body

  // Prevent duplicate category items in the same budget
  const existing = await db.query.budgetItems.findFirst({
    where: and(eq(budgetItems.budgetId, id), eq(budgetItems.categoryId, body.categoryId)),
  })
  if (existing) {
    return NextResponse.json(
      { data: null, error: 'A budget item for this category already exists' },
      { status: 409 },
    )
  }

  const [item] = await db
    .insert(budgetItems)
    .values({ budgetId: id, categoryId: body.categoryId, plannedAmount: body.plannedAmount })
    .returning()

  await applyRecurringToBudget(id, auth.userId)

  const itemWithRelations = await db.query.budgetItems.findFirst({
    where: eq(budgetItems.id, item!.id),
    with: { category: true, transactions: true },
  })

  return NextResponse.json({ data: itemWithRelations, error: null }, { status: 201 })
}
