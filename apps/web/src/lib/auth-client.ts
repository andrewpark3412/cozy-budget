import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001',
  fetchOptions: {
    // Ensure fetch sends credentials so cross-site cookies are included
    credentials: 'include',
  },
})

export const { signIn, signUp, signOut, useSession } = authClient

if (import.meta.env.MODE === 'production' && (import.meta.env['VITE_API_URL'] ?? '').includes('localhost')) {
  console.error('VITE_API_URL missing in production for auth client')
  throw new Error('VITE_API_URL is not set for production. Set it in your production env and rebuild.')
}
