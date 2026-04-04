import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001',
  fetchOptions: {
    // Ensure fetch sends credentials so cross-site cookies are included
    credentials: 'include',
  },
})

export const { signIn, signUp, signOut, useSession } = authClient

// Sign out and clear any client caches (service worker, Cache Storage, IndexedDB, localStorage)
export async function signOutAndClear() {
  try {
    // Perform the normal sign-out via the auth client
    await signOut()
  } catch (err) {
    // ignore — we still want to clear client caches even if signOut fails
    console.warn('signOut failed', err)
  }

  try {
    // Clear local/session storage
    try { localStorage.clear() } catch (_) {}
    try { sessionStorage.clear() } catch (_) {}

    // Clear caches (Cache Storage)
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }

    // Delete all IndexedDB databases where supported
    // indexedDB.databases() is not available in all browsers; wrap in try/catch
    try {
      // @ts-ignore
      if (indexedDB && indexedDB.databases) {
        // @ts-ignore
        const dbs = await indexedDB.databases()
        await Promise.all(dbs.map((d: any) => d.name && indexedDB.deleteDatabase(d.name)))
      }
    } catch (_) {}

    // Unregister service worker (if present)
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) await reg.unregister()
      }
    } catch (_) {}
  } finally {
    // Force a full reload to ensure no cached resources are used
    // add a cache-busting query param to avoid some aggressive caches
    const u = new URL(window.location.href)
    u.searchParams.set('_sw', Date.now().toString())
    window.location.href = u.toString()
  }
}

if (import.meta.env.MODE === 'production' && (import.meta.env['VITE_API_URL'] ?? '').includes('localhost')) {
  console.error('VITE_API_URL missing in production for auth client')
  throw new Error('VITE_API_URL is not set for production. Set it in your production env and rebuild.')
}
