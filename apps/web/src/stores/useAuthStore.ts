import { create } from 'zustand'
import { authClient } from '@/lib/auth-client'

interface AuthStore {
  /** Trigger a sign-out and clear local state. */
  signOut: () => Promise<void>
}

/**
 * Thin Zustand store for auth-related UI actions.
 * Session data (current user, loading state) comes from BetterAuth's
 * `useSession` hook — do not duplicate that state here.
 */
export const useAuthStore = create<AuthStore>()(() => ({
  signOut: async () => {
    await authClient.signOut()
  },
}))
