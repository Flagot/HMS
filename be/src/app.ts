import cors from 'cors'
import express from 'express'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth/auth.js'
import { getSetupStatus } from './controllers/auth.controller.js'
import { requireAuth, requireRole } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import adminRoutes from './routes/admin.routes.js'
import housekeepingRoutes from './routes/housekeeping.routes.js'
import kitchenRoutes from './routes/kitchen.routes.js'
import managerRoutes from './routes/manager.routes.js'
import receptionRoutes from './routes/reception.routes.js'
import storeRoutes from './routes/store.routes.js'
import waiterRoutes from './routes/waiter.routes.js'

const app = express()

const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  }),
)

// Better Auth must be mounted before express.json() (Express 5 catch-all).
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hms-be' })
})

app.get('/api/setup-status', getSetupStatus)

app.use(
  '/api/housekeeping',
  requireAuth,
  requireRole('housekeeping'),
  housekeepingRoutes,
)
app.use('/api/waiter', requireAuth, requireRole('waiter'), waiterRoutes)
app.use('/api/kitchen', requireAuth, requireRole('kitchen'), kitchenRoutes)
app.use(
  '/api/reception',
  requireAuth,
  requireRole('reception'),
  receptionRoutes,
)
app.use('/api/manager', requireAuth, requireRole('manager'), managerRoutes)
app.use('/api/store', requireAuth, requireRole('store'), storeRoutes)
app.use('/api/admin', requireAuth, requireRole('admin'), adminRoutes)

app.use(errorHandler)

export default app
