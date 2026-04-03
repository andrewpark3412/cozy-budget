import type { ApiResponse } from '@cozy-budget/shared'

const API_BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001'

// Fail fast in production when the bundle still points to localhost.
if (import.meta.env.MODE === 'production' && API_BASE.includes('localhost')) {
  console.error(
    'VITE_API_URL is not configured for production. Detected API_BASE:',
    API_BASE,
  )
  throw new Error(
    'VITE_API_URL is not set for production. Set VITE_API_URL in your production environment and rebuild before deploying.',
  )
}
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const json = (await res.json()) as ApiResponse<T>
  return json
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
