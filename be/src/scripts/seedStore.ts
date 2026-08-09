import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { seedStoreItems } from '../data/seedStore.js'
import { StoreItem } from '../models/StoreItem.js'
import { StockMovement } from '../models/StockMovement.js'

async function seed() {
  await connectDB()

  const force = process.argv.includes('--force')
  const count = await StoreItem.countDocuments()

  if (count > 0 && !force) {
    console.log(`Database already has ${count} store items. Skipping seed.`)
    console.log('To re-seed, run: npm run seed:store -- --force')
    process.exit(0)
  }

  if (force && count > 0) {
    await StockMovement.deleteMany({})
    await StoreItem.deleteMany({})
    console.log(`Cleared ${count} existing store items and movements.`)
  }

  const created = await StoreItem.insertMany(seedStoreItems)

  const movements = created
    .filter((item) => item.quantityOnHand > 0)
    .map((item) => ({
      item: item._id,
      type: 'receive' as const,
      quantity: item.quantityOnHand,
      balanceAfter: item.quantityOnHand,
      note: 'Seed stock',
      createdAt: new Date('2026-08-08T09:00:00.000Z'),
    }))

  if (movements.length > 0) {
    await StockMovement.insertMany(movements)
  }

  console.log(`Seeded ${created.length} store items successfully.`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
