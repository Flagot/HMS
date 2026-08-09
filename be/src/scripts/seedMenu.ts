import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { ensureMenuSeeded } from '../services/menuService.js'
import { MenuItem } from '../models/MenuItem.js'
import { menuCatalog } from '../data/menuCatalog.js'

async function seed() {
  await connectDB()

  const force = process.argv.includes('--force')
  const count = await MenuItem.countDocuments()

  if (count > 0 && !force) {
    console.log(`Database already has ${count} menu items. Skipping seed.`)
    console.log('To re-seed, run: npm run seed:menu -- --force')
    process.exit(0)
  }

  if (force && count > 0) {
    await MenuItem.deleteMany({})
    console.log(`Cleared ${count} existing menu items.`)
  }

  if (force || count === 0) {
    await MenuItem.insertMany(
      menuCatalog.map((item) => ({
        itemId: item.id,
        name: item.name,
        category: item.category,
        meals: item.meals,
        price: item.price,
        available: item.available,
      })),
    )
  } else {
    await ensureMenuSeeded()
  }

  console.log(`Seeded ${menuCatalog.length} menu items successfully.`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
