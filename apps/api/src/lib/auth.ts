import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'
import { users, sessions, accounts, verifications } from '@/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? '').split(',').filter(Boolean),
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          sameSite: 'none',
          secure: true,
          // Opt-in to partitioned cookies where supported to avoid upcoming
          // third-party cookie rejections in some browsers.
          // Runtimes/browsers that don't support this attribute will ignore it.
          partitioned: true,
        },
      },
      session_data: {
        attributes: {
          sameSite: 'none',
          secure: true,
          partitioned: true,
        },
      },
    },
  },
})

export type Auth = typeof auth
