import { z } from 'zod'
import { NextResponse } from 'next/server'

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns the parsed data or a 422 NextResponse.
 */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<T | NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { data: null, error: result.error.issues[0]?.message ?? 'Validation error' },
      { status: 422 },
    )
  }

  return result.data
}
