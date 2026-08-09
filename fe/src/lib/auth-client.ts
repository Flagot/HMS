import { createAuthClient } from 'better-auth/react'
import {
  adminClient,
  inferAdditionalFields,
  usernameClient,
} from 'better-auth/client/plugins'
import { API_BASE_URL } from '../api/client'
import { ac, roles } from './permissions'

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    usernameClient(),
    adminClient({
      ac,
      roles,
    }),
    inferAdditionalFields({
      user: {
        phone: {
          type: 'string',
          required: false,
        },
      },
    }),
  ],
})
