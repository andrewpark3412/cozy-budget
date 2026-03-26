import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { savingsGoals } from '@/db/schema/savings'
import { eq, and } from 'drizzle-orm'
import { addSavingsContributionSchema } from '@cozy-budget/shared'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const [goal] = await db
    .select()
    .from(savingsGoals)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, auth.userId)))
  if (!goal) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = addSavingsContributionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 422 })
  }

  const newAmount = goal.currentAmount + parsed.data.amount
  const isComplete = newAmount >= goal.targetAmount

  const [updated] = await db
    .update(savingsGoals)
    .set({ currentAmount: newAmount, isComplete, updatedAt: new Date() })
    .where(eq(savingsGoals.id, id))
    .returning()

  return NextResponse.json({ data: updated, error: null })
}
