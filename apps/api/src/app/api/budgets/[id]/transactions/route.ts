import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { budgets, transactions } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'

// GET /api/budgets/:id/transactions?itemId=
// Returns all transactions for the budget, optionally filtered by budgetItemId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // Verify ownership
  const budget = await db.query.budgets.findFirst({
    where: and(eq(budgets.id, id), eq(budgets.userId, auth.userId)),
  })
  if (!budget) {
    return NextResponse.json({ data: null, error: 'Budget not found' }, { status: 404 })
  }

  const { searchParams } = req.nextUrl
  const itemId = searchParams.get('itemId')
  // If an itemId is provided, verify it belongs to the requested budget
  if (itemId) {
    const item = await db.query.budgetItems.findFirst({
      where: and(eq(budgetItems.id, itemId), eq(budgetItems.budgetId, id)),
    })

    if (!item) {
      return NextResponse.json({ data: null, error: 'Budget item not found' }, { status: 404 })
    }

    const rows = await db.query.transactions.findMany({
      where: (t, { eq }) => eq(t.budgetItemId, itemId),
      with: { budgetItem: true },
      orderBy: (t, { desc }) => [desc(t.date), desc(t.createdAt)],
    })

    return NextResponse.json({ data: rows, error: null })
  }

  // Fetch transactions for this budget by joining through budget_items
  const rows = await db.query.transactions.findMany({
    with: { budgetItem: true },
    orderBy: (t, { desc }) => [desc(t.date), desc(t.createdAt)],
  })

  // Filter to only this budget's items when no itemId is specified
  const filtered = rows.filter((t) => t.budgetItem.budgetId === id)

  return NextResponse.json({ data: filtered, error: null })
}
