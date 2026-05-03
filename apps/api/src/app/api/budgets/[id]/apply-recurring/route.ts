import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { applyRecurringToBudget } from '@/lib/applyRecurring'

// POST /api/budgets/:id/apply-recurring
// Applies active recurring items to this budget month, creating auto-generated transactions.
// Idempotent: it creates only missing recurring transactions for this budget.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const result = await applyRecurringToBudget(id, auth.userId)
  if (!result) {
    return NextResponse.json({ data: null, error: 'Budget not found' }, { status: 404 })
  }

  return NextResponse.json({ data: result, error: null })
}
