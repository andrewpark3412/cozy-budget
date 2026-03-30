import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = (process.env['TRUSTED_ORIGINS'] ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

function applyCors(res: NextResponse, origin: string | null): NextResponse {
  // Only set Access-Control-Allow-Origin for explicitly trusted origins.
  // Never use '*' because we send credentials (cookies).
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Vary', 'Origin')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, DELETE, OPTIONS',
    )
    res.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    )
  }
  return res
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin')

  // Respond to CORS preflight requests immediately
  if (req.method === 'OPTIONS') {
    return applyCors(new NextResponse(null, { status: 204 }), origin)
  }

  return applyCors(NextResponse.next(), origin)
}

export const config = {
  // Apply only to API routes — skip Next.js internals and static files
  matcher: '/api/:path*',
}
