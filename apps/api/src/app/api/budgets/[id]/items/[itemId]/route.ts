import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { budgets, budgetItems } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { updateBudgetItemSchema } from '@cozy-budget/shared'

async function resolveBudgetItem(userId: string, budgetId: string, itemId: string) {
  const budget = await db.query.budgets.findFirst({
    where: and(eq(budgets.id, budgetId), eq(budgets.userId, userId)),
  })
  if (!budget) return null

  const item = await db.query.budgetItems.findFirst({
    where: and(eq(budgetItems.id, itemId), eq(budgetItems.budgetId, budgetId)),
  })
  return item ?? null
}

// PATCH /api/budgets/:id/items/:itemId — update planned amount
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id, itemId } = await params

  const item = await resolveBudgetItem(auth.userId, id, itemId)
  if (!item) {
    return NextResponse.json({ data: null, error: 'Budget item not found' }, { status: 404 })
  }

  const body = await parseBody(req, updateBudgetItemSchema)
  if (body instanceof NextResponse) return body

  const [updated] = await db
    .update(budgetItems)
    .set({ plannedAmount: body.plannedAmount, updatedAt: new Date() })
    .where(eq(budgetItems.id, itemId))
    .returning()

  const itemWithRelations = await db.query.budgetItems.findFirst({
    where: eq(budgetItems.id, updated!.id),
    with: { category: true, transactions: true },
  })

  return NextResponse.json({ data: itemWithRelations, error: null })
}

// DELETE /api/budgets/:id/items/:itemId — remove a budget item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id, itemId } = await params

  const item = await resolveBudgetItem(auth.userId, id, itemId)
  if (!item) {
    return NextResponse.json({ data: null, error: 'Budget item not found' }, { status: 404 })
  }

  await db.delete(budgetItems).where(eq(budgetItems.id, itemId))

  return NextResponse.json({ data: { id: itemId }, error: null })
}
