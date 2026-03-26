import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { recurringItems } from '@/db/schema'
import { requireAuth } from '@/middleware/requireAuth'
import { parseBody } from '@/lib/validation'
import { updateRecurringItemSchema } from '@cozy-budget/shared'

// PATCH /api/recurring-items/:id — update name, amount, dayOfMonth, or toggle active
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const item = await db.query.recurringItems.findFirst({
    where: and(eq(recurringItems.id, id), eq(recurringItems.userId, auth.userId)),
  })
  if (!item) {
    return NextResponse.json({ data: null, error: 'Recurring item not found' }, { status: 404 })
  }

  const body = await parseBody(req, updateRecurringItemSchema)
  if (body instanceof NextResponse) return body

  const [updated] = await db
    .update(recurringItems)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(recurringItems.id, id))
    .returning()

  const withCategory = await db.query.recurringItems.findFirst({
    where: eq(recurringItems.id, updated!.id),
    with: { category: true },
  })

  return NextResponse.json({ data: withCategory, error: null })
}

// DELETE /api/recurring-items/:id — hard delete (deactivate by PATCH isActive=false instead)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const item = await db.query.recurringItems.findFirst({
    where: and(eq(recurringItems.id, id), eq(recurringItems.userId, auth.userId)),
  })
  if (!item) {
    return NextResponse.json({ data: null, error: 'Recurring item not found' }, { status: 404 })
  }

  await db.delete(recurringItems).where(eq(recurringItems.id, id))

  return NextResponse.json({ data: { id }, error: null })
}
