import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNotNull } from 'drizzle-orm'
import { db } from '@/db'
import { categories } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { updateCategorySchema } from '@cozy-budget/shared'

// PATCH /api/categories/:id — rename a custom category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // Only allow editing the user's own custom (non-system) categories
  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, id),
      eq(categories.userId, auth.userId),
      eq(categories.isSystem, false),
    ),
  })
  if (!category) {
    return NextResponse.json({ data: null, error: 'Category not found' }, { status: 404 })
  }

  const body = await parseBody(req, updateCategorySchema)
  if (body instanceof NextResponse) return body

  const [updated] = await db
    .update(categories)
    .set({ name: body.name, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()

  return NextResponse.json({ data: updated, error: null })
}

// DELETE /api/categories/:id — delete a custom (non-system) category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, id),
      eq(categories.userId, auth.userId),
      eq(categories.isSystem, false),
    ),
  })
  if (!category) {
    return NextResponse.json({ data: null, error: 'Category not found' }, { status: 404 })
  }

  await db.delete(categories).where(eq(categories.id, id))

  return NextResponse.json({ data: { id }, error: null })
}
