import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { Order } from '../models/Order.js'
import { seedOrders } from '../data/seedOrders.js'

async function seed() {
  await connectDB()

  const force = process.argv.includes('--force')
  const count = await Order.countDocuments()

  if (count > 0 && !force) {
    console.log(`Database already has ${count} orders. Skipping seed.`)
    console.log('To re-seed, run: npm run seed:orders -- --force')
    process.exit(0)
  }

  if (force && count > 0) {
    await Order.deleteMany({})
    console.log(`Cleared ${count} existing orders.`)
  }

  await Order.insertMany(seedOrders)
  console.log(`Seeded ${seedOrders.length} orders successfully.`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
