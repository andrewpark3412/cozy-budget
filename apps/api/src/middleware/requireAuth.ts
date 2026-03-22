import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Verifies the BetterAuth session from the request.
 * Returns the userId on success, or sends a 401 response on failure.
 *
 * Usage in a route handler:
 *   const result = await requireAuth(req)
 *   if (result instanceof NextResponse) return result
 *   const { userId } = result
 */
export async function requireAuth(
  req: NextRequest,
): Promise<{ userId: string } | NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers })

  if (!session?.user?.id) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  return { userId: session.user.id }
}
