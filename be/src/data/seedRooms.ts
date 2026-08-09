import type { RoomStatus, RoomType } from '../types/room.js'

type SeedRoom = {
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  name: string
  description: string
  amenities: string[]
  capacity: number
  bedType: string
  sizeSqm: number
  ratePerNight: number
  imageUrl: string
  note?: string
  updatedAt: Date
}

const standardAmenities = ['Wi-Fi', 'TV', 'Air conditioning', 'Work desk', 'En-suite bathroom']
const deluxeAmenities = [...standardAmenities, 'Mini fridge', 'City view', 'Rain shower']
const suiteAmenities = [...deluxeAmenities, 'Living area', 'Balcony', 'Bathrobe & slippers', 'Nespresso']

export const seedRooms: SeedRoom[] = [
  {
    number: '101',
    floor: 1,
    type: 'standard',
    status: 'clean',
    name: 'Courtyard Standard',
    description: 'Comfortable standard room overlooking the courtyard, ideal for short business stays.',
    amenities: standardAmenities,
    capacity: 2,
    bedType: 'Queen',
    sizeSqm: 22,
    ratePerNight: 1800,
    imageUrl:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T08:00:00'),
  },
  {
    number: '102',
    floor: 1,
    type: 'standard',
    status: 'dirty',
    name: 'Courtyard Standard',
    description: 'Bright standard room with courtyard outlook and a quiet work corner.',
    amenities: standardAmenities,
    capacity: 2,
    bedType: 'Queen',
    sizeSqm: 22,
    ratePerNight: 1800,
    imageUrl:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
    note: 'Guest checked out 10:30 AM',
    updatedAt: new Date('2026-08-09T10:30:00'),
  },
  {
    number: '103',
    floor: 1,
    type: 'deluxe',
    status: 'in_progress',
    name: 'Garden Deluxe',
    description: 'Spacious deluxe room with garden views and upgraded bathroom finishes.',
    amenities: deluxeAmenities,
    capacity: 2,
    bedType: 'King',
    sizeSqm: 30,
    ratePerNight: 2600,
    imageUrl:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T11:00:00'),
  },
  {
    number: '104',
    floor: 1,
    type: 'standard',
    status: 'dirty',
    name: 'Courtyard Standard',
    description: 'Practical standard room close to reception, great for early arrivals.',
    amenities: standardAmenities,
    capacity: 2,
    bedType: 'Twin',
    sizeSqm: 21,
    ratePerNight: 1750,
    imageUrl:
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T09:45:00'),
  },
  {
    number: '201',
    floor: 2,
    type: 'deluxe',
    status: 'clean',
    name: 'City Deluxe',
    description: 'Deluxe room with skyline views, seating nook, and premium bedding.',
    amenities: deluxeAmenities,
    capacity: 2,
    bedType: 'King',
    sizeSqm: 32,
    ratePerNight: 2800,
    imageUrl:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T07:30:00'),
  },
  {
    number: '202',
    floor: 2,
    type: 'deluxe',
    status: 'inspect',
    name: 'City Deluxe',
    description: 'Calm deluxe room with soft lighting and a dedicated writing desk.',
    amenities: deluxeAmenities,
    capacity: 2,
    bedType: 'King',
    sizeSqm: 31,
    ratePerNight: 2750,
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    note: 'Maintenance flagged minibar',
    updatedAt: new Date('2026-08-09T10:00:00'),
  },
  {
    number: '203',
    floor: 2,
    type: 'suite',
    status: 'dirty',
    name: 'Ambassador Suite',
    description: 'Separate living area and bedroom with balcony access and suite amenities.',
    amenities: suiteAmenities,
    capacity: 3,
    bedType: 'King + sofa bed',
    sizeSqm: 48,
    ratePerNight: 4500,
    imageUrl:
      'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
    note: 'Late checkout',
    updatedAt: new Date('2026-08-09T11:15:00'),
  },
  {
    number: '204',
    floor: 2,
    type: 'standard',
    status: 'in_progress',
    name: 'Courtyard Standard',
    description: 'Quiet standard room on the second floor with courtyard light.',
    amenities: standardAmenities,
    capacity: 2,
    bedType: 'Queen',
    sizeSqm: 22,
    ratePerNight: 1850,
    imageUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T11:30:00'),
  },
  {
    number: '301',
    floor: 3,
    type: 'suite',
    status: 'clean',
    name: 'Panorama Suite',
    description: 'Top-floor suite with wide views, lounge seating, and enhanced amenities.',
    amenities: suiteAmenities,
    capacity: 3,
    bedType: 'King + sofa bed',
    sizeSqm: 52,
    ratePerNight: 5200,
    imageUrl:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T08:45:00'),
  },
  {
    number: '302',
    floor: 3,
    type: 'suite',
    status: 'dirty',
    name: 'Panorama Suite',
    description: 'Expansive suite for longer stays, with a dining nook and balcony.',
    amenities: suiteAmenities,
    capacity: 4,
    bedType: 'King + twin sofa',
    sizeSqm: 55,
    ratePerNight: 5400,
    imageUrl:
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T10:00:00'),
  },
  {
    number: '303',
    floor: 3,
    type: 'deluxe',
    status: 'clean',
    name: 'City Deluxe',
    description: 'Corner deluxe room with soft natural light and a lounge chair.',
    amenities: deluxeAmenities,
    capacity: 2,
    bedType: 'King',
    sizeSqm: 33,
    ratePerNight: 2900,
    imageUrl:
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T09:00:00'),
  },
  {
    number: '304',
    floor: 3,
    type: 'standard',
    status: 'dirty',
    name: 'Courtyard Standard',
    description: 'Compact and efficient standard room for overnight guests.',
    amenities: standardAmenities,
    capacity: 2,
    bedType: 'Queen',
    sizeSqm: 20,
    ratePerNight: 1700,
    imageUrl:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    updatedAt: new Date('2026-08-09T11:45:00'),
  },
]
