import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { transactions } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { updateTransactionSchema } from '@cozy-budget/shared'

async function resolveTransaction(userId: string, txId: string) {
  const tx = await db.query.transactions.findFirst({
    where: (t, { eq }) => eq(t.id, txId),
    with: { budgetItem: { with: { budget: true } } },
  })
  if (!tx || tx.budgetItem.budget.userId !== userId) return null
  return tx
}

// PATCH /api/transactions/:id — edit amount, date, or note
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const tx = await resolveTransaction(auth.userId, id)
  if (!tx) {
    return NextResponse.json({ data: null, error: 'Transaction not found' }, { status: 404 })
  }

  const body = await parseBody(req, updateTransactionSchema)
  if (body instanceof NextResponse) return body

  const [updated] = await db
    .update(transactions)
    .set({
      ...(body.amount !== undefined && { amount: body.amount }),
      ...(body.date !== undefined && { date: body.date }),
      ...(body.note !== undefined && { note: body.note }),
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id))
    .returning()

  return NextResponse.json({ data: updated, error: null })
}

// DELETE /api/transactions/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const tx = await resolveTransaction(auth.userId, id)
  if (!tx) {
    return NextResponse.json({ data: null, error: 'Transaction not found' }, { status: 404 })
  }

  await db.delete(transactions).where(eq(transactions.id, id))

  return NextResponse.json({ data: { id }, error: null })
}
