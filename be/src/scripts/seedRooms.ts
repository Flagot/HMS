import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { Room } from '../models/Room.js'
import { seedRooms } from '../data/seedRooms.js'

async function seed() {
  await connectDB()

  const count = await Room.countDocuments()
  if (count > 0) {
    console.log(`Database already has ${count} rooms. Skipping seed.`)
    console.log('To re-seed, clear the rooms collection in Atlas first.')
    process.exit(0)
  }

  await Room.insertMany(seedRooms)
  console.log(`Seeded ${seedRooms.length} rooms successfully.`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
