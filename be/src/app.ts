import cors from 'cors'
import express from 'express'
import housekeepingRoutes from './routes/housekeeping.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hms-be' })
})

app.use('/api/housekeeping', housekeepingRoutes)

app.use(errorHandler)

export default app
