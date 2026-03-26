import { NextRequest, NextResponse } from 'next/server'
import { or, isNull, eq } from 'drizzle-orm'
import { db } from '@/db'
import { categories } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { createCategorySchema } from '@cozy-budget/shared'

// GET /api/categories — system categories + user's custom categories
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const rows = await db.query.categories.findMany({
    where: or(isNull(categories.userId), eq(categories.userId, auth.userId)),
    orderBy: (c, { asc }) => [asc(c.sortOrder), asc(c.name)],
  })

  return NextResponse.json({ data: rows, error: null })
}

// POST /api/categories — create a custom category
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await parseBody(req, createCategorySchema)
  if (body instanceof NextResponse) return body

  const [category] = await db
    .insert(categories)
    .values({ userId: auth.userId, name: body.name, type: body.type })
    .returning()

  return NextResponse.json({ data: category, error: null }, { status: 201 })
}
