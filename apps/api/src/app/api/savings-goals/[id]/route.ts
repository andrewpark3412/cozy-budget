import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { savingsGoals } from '@/db/schema/savings'
import { eq, and } from 'drizzle-orm'
import { updateSavingsGoalSchema } from '@cozy-budget/shared'

async function resolveGoal(goalId: string, userId: string) {
  const [goal] = await db
    .select()
    .from(savingsGoals)
    .where(and(eq(savingsGoals.id, goalId), eq(savingsGoals.userId, userId)))
  return goal ?? null
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const goal = await resolveGoal(id, auth.userId)
  if (!goal) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateSavingsGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 422 })
  }

  const updates: Partial<typeof goal> = {}
  if (parsed.data.name !== undefined) updates.name = parsed.data.name
  if (parsed.data.targetAmount !== undefined) updates.targetAmount = parsed.data.targetAmount
  if ('targetDate' in parsed.data) updates.targetDate = parsed.data.targetDate ?? null
  updates.updatedAt = new Date()

  const [updated] = await db
    .update(savingsGoals)
    .set(updates)
    .where(eq(savingsGoals.id, id))
    .returning()

  return NextResponse.json({ data: updated, error: null })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const goal = await resolveGoal(id, auth.userId)
  if (!goal) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })

  await db.delete(savingsGoals).where(eq(savingsGoals.id, id))
  return NextResponse.json({ data: { id }, error: null })
}
