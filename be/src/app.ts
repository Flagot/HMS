import cors from 'cors'
import express from 'express'
import adminRoutes from './routes/admin.routes.js'
import housekeepingRoutes from './routes/housekeeping.routes.js'
import kitchenRoutes from './routes/kitchen.routes.js'
import managerRoutes from './routes/manager.routes.js'
import receptionRoutes from './routes/reception.routes.js'
import storeRoutes from './routes/store.routes.js'
import waiterRoutes from './routes/waiter.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hms-be' })
})

app.use('/api/housekeeping', housekeepingRoutes)
app.use('/api/waiter', waiterRoutes)
app.use('/api/kitchen', kitchenRoutes)
app.use('/api/reception', receptionRoutes)
app.use('/api/manager', managerRoutes)
app.use('/api/store', storeRoutes)
app.use('/api/admin', adminRoutes)

app.use(errorHandler)

export default app
