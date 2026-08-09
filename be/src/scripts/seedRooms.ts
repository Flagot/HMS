import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { Room } from '../models/Room.js'
import { seedRooms } from '../data/seedRooms.js'

async function seed() {
  await connectDB()

  const force = process.argv.includes('--force')
  const count = await Room.countDocuments()

  if (count > 0 && !force) {
    // Patch details onto existing rooms without wiping housekeeping status/notes.
    let updated = 0
    for (const seed of seedRooms) {
      const result = await Room.updateOne(
        { number: seed.number },
        {
          $set: {
            name: seed.name,
            description: seed.description,
            amenities: seed.amenities,
            capacity: seed.capacity,
            bedType: seed.bedType,
            sizeSqm: seed.sizeSqm,
            ratePerNight: seed.ratePerNight,
            imageUrl: seed.imageUrl,
            type: seed.type,
            floor: seed.floor,
          },
        },
      )
      if (result.matchedCount > 0) updated += 1
    }
    console.log(`Updated details on ${updated} existing rooms.`)
    console.log('To fully re-seed rooms, run: npm run seed -- --force')
    process.exit(0)
  }

  if (force && count > 0) {
    await Room.deleteMany({})
    console.log(`Cleared ${count} existing rooms.`)
  }

  await Room.insertMany(seedRooms)
  console.log(`Seeded ${seedRooms.length} rooms successfully.`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
