import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { Expense } from '../models/Expense.js'
import { seedExpenses } from '../data/seedExpenses.js'

async function seed() {
  await connectDB()

  const force = process.argv.includes('--force')
  const count = await Expense.countDocuments()

  if (count > 0 && !force) {
    console.log(`Database already has ${count} expenses. Skipping seed.`)
    console.log('To re-seed, run: npm run seed:expenses -- --force')
    process.exit(0)
  }

  if (force && count > 0) {
    await Expense.deleteMany({})
    console.log(`Cleared ${count} existing expenses.`)
  }

  await Expense.insertMany(seedExpenses)
  console.log(`Seeded ${seedExpenses.length} expenses successfully.`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
