import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { debts } from '@/db/schema/debts'
import { eq, asc } from 'drizzle-orm'
import { createDebtSchema } from '@cozy-budget/shared'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const rows = await db
    .select()
    .from(debts)
    .where(eq(debts.userId, auth.userId))
    .orderBy(asc(debts.sortOrder), asc(debts.currentBalance))

  return NextResponse.json({ data: rows, error: null })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const parsed = createDebtSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 422 })
  }

  const [debt] = await db
    .insert(debts)
    .values({ userId: auth.userId, ...parsed.data })
    .returning()

  return NextResponse.json({ data: debt, error: null }, { status: 201 })
}
