import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { recurringItems } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { createRecurringItemSchema } from '@cozy-budget/shared'

// GET /api/recurring-items — list all active recurring items for the user
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const items = await db.query.recurringItems.findMany({
    where: eq(recurringItems.userId, auth.userId),
    with: { category: true },
    orderBy: (r, { asc }) => [asc(r.name)],
  })

  return NextResponse.json({ data: items, error: null })
}

// POST /api/recurring-items — create a new recurring item
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await parseBody(req, createRecurringItemSchema)
  if (body instanceof NextResponse) return body

  const [item] = await db
    .insert(recurringItems)
    .values({ userId: auth.userId, ...body })
    .returning()

  const itemWithCategory = await db.query.recurringItems.findFirst({
    where: eq(recurringItems.id, item!.id),
    with: { category: true },
  })

  return NextResponse.json({ data: itemWithCategory, error: null }, { status: 201 })
}
