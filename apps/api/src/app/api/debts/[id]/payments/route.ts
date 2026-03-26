import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { debts, debtPayments } from '@/db/schema/debts'
import { eq, and, desc } from 'drizzle-orm'
import { recordDebtPaymentSchema } from '@cozy-budget/shared'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const [debt] = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, id), eq(debts.userId, auth.userId)))
  if (!debt) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })

  const payments = await db
    .select()
    .from(debtPayments)
    .where(eq(debtPayments.debtId, id))
    .orderBy(desc(debtPayments.paymentDate))

  return NextResponse.json({ data: payments, error: null })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const [debt] = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, id), eq(debts.userId, auth.userId)))
  if (!debt) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = recordDebtPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 422 })
  }

  const newBalance = Math.max(0, debt.currentBalance - parsed.data.amount)

  await db.transaction(async (tx) => {
    await tx.insert(debtPayments).values({ debtId: id, ...parsed.data })
    await tx
      .update(debts)
      .set({ currentBalance: newBalance, updatedAt: new Date() })
      .where(eq(debts.id, id))
  })

  const [updatedDebt] = await db.select().from(debts).where(eq(debts.id, id))
  return NextResponse.json({ data: updatedDebt, error: null }, { status: 201 })
}
