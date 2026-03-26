import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { savingsGoals } from '@/db/schema/savings'
import { eq, asc } from 'drizzle-orm'
import { createSavingsGoalSchema } from '@cozy-budget/shared'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const goals = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, auth.userId))
    .orderBy(asc(savingsGoals.createdAt))

  return NextResponse.json({ data: goals, error: null })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const parsed = createSavingsGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 422 })
  }

  const { name, targetAmount, targetDate } = parsed.data
  const [goal] = await db
    .insert(savingsGoals)
    .values({
      userId: auth.userId,
      name,
      targetAmount,
      targetDate: targetDate ?? null,
    })
    .returning()

  return NextResponse.json({ data: goal, error: null }, { status: 201 })
}
