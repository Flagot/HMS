import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { Reservation } from '../models/Reservation.js'
import { Room } from '../models/Room.js'
import { seedReservations } from '../data/seedReservations.js'
import {
  countNights,
  derivePaymentStatus,
  roundMoney,
} from '../utils/payment.js'

async function seed() {
  await connectDB()

  const force = process.argv.includes('--force')
  const count = await Reservation.countDocuments()

  if (count > 0 && !force) {
    console.log(`Database already has ${count} reservations. Skipping seed.`)
    console.log('To re-seed, run: npm run seed:reservations -- --force')
    process.exit(0)
  }

  if (force && count > 0) {
    await Reservation.deleteMany({})
    console.log(`Cleared ${count} existing reservations.`)
  }

  const rooms = await Room.find()
  if (rooms.length === 0) {
    console.error('No rooms found. Run npm run seed first.')
    process.exit(1)
  }

  const roomByNumber = new Map(rooms.map((room) => [room.number, room]))

  const docs = seedReservations.map((entry) => {
    const room = entry.roomNumber ? roomByNumber.get(entry.roomNumber) : undefined
    const nights = countNights(entry.checkInDate, entry.checkOutDate)
    const ratePerNight = roundMoney(room?.ratePerNight ?? 0)
    const totalAmount = roundMoney(ratePerNight * nights)
    const amountPaid = roundMoney(totalAmount * entry.paidRatio)

    return {
      confirmationCode: entry.confirmationCode,
      guestName: entry.guestName,
      phone: entry.phone,
      email: entry.email,
      roomType: entry.roomType,
      roomId: room?._id,
      checkInDate: entry.checkInDate,
      checkOutDate: entry.checkOutDate,
      nights,
      ratePerNight,
      totalAmount,
      amountPaid,
      paymentStatus: derivePaymentStatus(totalAmount, amountPaid),
      adults: entry.adults,
      status: entry.status,
      note: entry.note,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }
  })

  await Reservation.insertMany(docs)

  const occupiedDocs = docs.filter((doc) => doc.status === 'checked_in' && doc.roomId)
  for (const occupied of occupiedDocs) {
    await Room.findByIdAndUpdate(occupied.roomId, {
      note: `Occupied · ${occupied.guestName}`,
      status: 'clean',
    })
  }

  console.log(`Seeded ${docs.length} reservations successfully.`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
