import 'dotenv/config'
import app from './app.js'
import { authMongoClient } from './auth/auth.js'
import { connectDB } from './config/db.js'

const PORT = Number(process.env.PORT) || 5000

async function start() {
  await authMongoClient.connect()
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
