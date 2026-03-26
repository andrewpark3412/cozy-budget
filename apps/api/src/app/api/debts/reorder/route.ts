import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { debts } from '@/db/schema/debts'
import { eq, and } from 'drizzle-orm'
import { reorderDebtsSchema } from '@cozy-budget/shared'

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const parsed = reorderDebtsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 422 })
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < parsed.data.orderedIds.length; i++) {
      await tx
        .update(debts)
        .set({ sortOrder: i })
        .where(and(eq(debts.id, parsed.data.orderedIds[i]), eq(debts.userId, auth.userId)))
    }
  })

  return NextResponse.json({ data: { ok: true }, error: null })
}
