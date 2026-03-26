import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { transactions } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { createTransactionSchema } from '@cozy-budget/shared'

// POST /api/transactions — record a new transaction against a budget item
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await parseBody(req, createTransactionSchema)
  if (body instanceof NextResponse) return body

  // Verify the budgetItem belongs to the authenticated user (via budget.userId)
  const item = await db.query.budgetItems.findFirst({
    where: (bi, { eq }) => eq(bi.id, body.budgetItemId),
    with: { budget: true },
  })

  if (!item || item.budget.userId !== auth.userId) {
    return NextResponse.json({ data: null, error: 'Budget item not found' }, { status: 404 })
  }

  const [tx] = await db
    .insert(transactions)
    .values({
      budgetItemId: body.budgetItemId,
      amount: body.amount,
      date: body.date,
      note: body.note ?? null,
    })
    .returning()

  return NextResponse.json({ data: tx, error: null }, { status: 201 })
}
