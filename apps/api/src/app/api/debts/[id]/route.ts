import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { debts } from '@/db/schema/debts'
import { eq, and } from 'drizzle-orm'
import { updateDebtSchema } from '@cozy-budget/shared'

async function resolveDebt(debtId: string, userId: string) {
  const [debt] = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, debtId), eq(debts.userId, userId)))
  return debt ?? null
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const debt = await resolveDebt(id, auth.userId)
  if (!debt) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateDebtSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 422 })
  }

  const [updated] = await db
    .update(debts)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(debts.id, id))
    .returning()

  return NextResponse.json({ data: updated, error: null })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const debt = await resolveDebt(id, auth.userId)
  if (!debt) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })

  await db.delete(debts).where(eq(debts.id, id))
  return NextResponse.json({ data: { id }, error: null })
}
