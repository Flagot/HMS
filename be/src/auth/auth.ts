import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { createAuthMiddleware, APIError } from 'better-auth/api'
import { admin, username } from 'better-auth/plugins'
import { MongoClient } from 'mongodb'
import { ac, roles, isStaffRoleId } from './permissions.js'

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables')
}

const betterAuthSecret = process.env.BETTER_AUTH_SECRET
if (!betterAuthSecret) {
  throw new Error('BETTER_AUTH_SECRET is not defined in environment variables')
}

const betterAuthUrl =
  process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT || 5000}`

const trustedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

/** Shared Mongo client for Better Auth (collections: user, session, account, verification). */
export const authMongoClient = new MongoClient(mongoUri)
export const authDb = authMongoClient.db()

const PLACEHOLDER_EMAIL_DOMAIN = 'noemail.local'

function toPlaceholderEmail(usernameValue: string): string {
  const local = usernameValue
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 48)
  return `${local || 'user'}@${PLACEHOLDER_EMAIL_DOMAIN}`
}

function normalizeOptionalEmail(
  email: unknown,
  usernameValue: string,
): string {
  if (typeof email === 'string' && email.trim()) {
    return email.trim().toLowerCase()
  }
  return toPlaceholderEmail(usernameValue)
}

export const auth = betterAuth({
  database: mongodbAdapter(authDb, { client: authMongoClient }),
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
    admin({
      ac,
      roles,
      defaultRole: 'reception',
      adminRoles: ['admin'],
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const existing = await authDb.collection('user').countDocuments()
          if (existing === 0) {
            return {
              data: {
                ...user,
                role: 'admin',
              },
            }
          }
          return { data: user }
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        const existing = await authDb.collection('user').countDocuments()
        if (existing > 0) {
          throw new APIError('FORBIDDEN', {
            message:
              'Public sign-up is closed. Ask an administrator to create your account.',
          })
        }

        const body = ctx.body as Record<string, unknown> | undefined
        const usernameValue =
          typeof body?.username === 'string' ? body.username.trim() : ''

        if (!usernameValue) {
          throw new APIError('BAD_REQUEST', {
            message: 'Username is required',
          })
        }

        return {
          context: {
            ...ctx,
            body: {
              ...body,
              email: normalizeOptionalEmail(body?.email, usernameValue),
            },
          },
        }
      }

      if (ctx.path === '/admin/create-user') {
        const body = ctx.body as Record<string, unknown> | undefined
        const data =
          body?.data && typeof body.data === 'object'
            ? { ...(body.data as Record<string, unknown>) }
            : {}

        const usernameValue =
          typeof body?.username === 'string'
            ? body.username.trim()
            : typeof data.username === 'string'
              ? String(data.username).trim()
              : ''

        if (!usernameValue) {
          throw new APIError('BAD_REQUEST', {
            message: 'Username is required',
          })
        }

        const role = body?.role
        if (role !== undefined && !isStaffRoleId(role)) {
          throw new APIError('BAD_REQUEST', {
            message: 'Invalid staff role',
          })
        }

        const phone =
          typeof body?.phone === 'string' && body.phone.trim()
            ? body.phone.trim()
            : typeof data.phone === 'string' && String(data.phone).trim()
              ? String(data.phone).trim()
              : undefined

        return {
          context: {
            ...ctx,
            body: {
              ...body,
              email: normalizeOptionalEmail(body?.email, usernameValue),
              data: {
                ...data,
                username: usernameValue,
                ...(phone ? { phone } : {}),
              },
            },
          },
        }
      }
    }),
  },
})

export type SessionUser = typeof auth.$Infer.Session.user
