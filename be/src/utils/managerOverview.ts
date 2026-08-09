import { Order } from '../models/Order.js'
import { Reservation } from '../models/Reservation.js'
import { Room } from '../models/Room.js'
import type {
  ManagerFnbSnapshot,
  ManagerOverviewResponse,
  ManagerRoomSnapshot,
} from '../types/manager.js'
import type { IncomeSummaryResponse } from '../types/reservation.js'
import type { ReceptionRoomResponse } from '../types/reservation.js'
import {
  derivePaymentStatus,
  roundMoney,
  staysIncludeDate,
} from './payment.js'
import { toReceptionRoomResponse } from './reservationMapper.js'

function startOfUtcDay(day: Date): Date {
  return new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0),
  )
}

function endOfUtcDay(day: Date): Date {
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  )
}

export async function buildStayIncomeSummary(day: Date): Promise<IncomeSummaryResponse> {
  const occupied = await Reservation.find({ status: 'checked_in' })
  const activeToday = occupied.filter((reservation) =>
    staysIncludeDate(reservation.checkInDate, reservation.checkOutDate, day),
  )

  let totalBilled = 0
  let totalPaid = 0
  let todayNightValue = 0
  let occupiedFullyPaid = 0
  let occupiedUnpaidOrPartial = 0

  for (const reservation of activeToday) {
    const billed = roundMoney(reservation.totalAmount ?? 0)
    const paid = roundMoney(reservation.amountPaid ?? 0)
    const status =
      reservation.paymentStatus || derivePaymentStatus(billed, paid)

    totalBilled += billed
    totalPaid += paid
    todayNightValue += roundMoney(reservation.ratePerNight ?? 0)

    if (status === 'paid') occupiedFullyPaid += 1
    else occupiedUnpaidOrPartial += 1
  }

  return {
    date: day.toISOString().slice(0, 10),
    occupiedRooms: activeToday.length,
    occupiedFullyPaid,
    occupiedUnpaidOrPartial,
    totalBilled: roundMoney(totalBilled),
    totalPaid: roundMoney(totalPaid),
    totalBalanceDue: roundMoney(Math.max(0, totalBilled - totalPaid)),
    todayNightValue: roundMoney(todayNightValue),
  }
}

export async function loadRoomsWithOccupancy(): Promise<ReceptionRoomResponse[]> {
  const [rooms, active] = await Promise.all([
    Room.find().sort({ number: 1 }),
    Reservation.find({
      status: { $in: ['reserved', 'checked_in'] },
      roomId: { $ne: null },
    }),
  ])

  const occupancyByRoom = new Map<string, 'reserved' | 'occupied'>()
  for (const reservation of active) {
    if (!reservation.roomId) continue
    occupancyByRoom.set(
      reservation.roomId.toString(),
      reservation.status === 'checked_in' ? 'occupied' : 'reserved',
    )
  }

  return rooms.map((room) =>
    toReceptionRoomResponse(
      room,
      occupancyByRoom.get(room._id.toString()) ?? 'vacant',
    ),
  )
}

function summarizeRooms(rooms: ReceptionRoomResponse[]): ManagerRoomSnapshot {
  const snapshot: ManagerRoomSnapshot = {
    total: rooms.length,
    vacant: 0,
    reserved: 0,
    occupied: 0,
    housekeeping: {
      dirty: 0,
      in_progress: 0,
      clean: 0,
      inspect: 0,
    },
  }

  for (const room of rooms) {
    snapshot[room.occupancy] += 1
    snapshot.housekeeping[room.housekeepingStatus] += 1
  }

  return snapshot
}

async function buildFnbSnapshot(day: Date): Promise<ManagerFnbSnapshot> {
  const orders = await Order.find({
    createdAt: {
      $gte: startOfUtcDay(day),
      $lte: endOfUtcDay(day),
    },
  })

  const snapshot: ManagerFnbSnapshot = {
    orderCount: orders.length,
    servedCount: 0,
    revenueTotal: 0,
    byType: { table: 0, room_service: 0 },
    byStatus: { pending: 0, preparing: 0, ready: 0, served: 0 },
  }

  for (const order of orders) {
    snapshot.byType[order.type] += 1
    snapshot.byStatus[order.status] += 1
    if (order.status === 'served') snapshot.servedCount += 1
    snapshot.revenueTotal += roundMoney(order.total ?? 0)
  }

  snapshot.revenueTotal = roundMoney(snapshot.revenueTotal)
  return snapshot
}

export async function buildManagerOverview(day: Date): Promise<ManagerOverviewResponse> {
  const [rooms, stays, fnb] = await Promise.all([
    loadRoomsWithOccupancy(),
    buildStayIncomeSummary(day),
    buildFnbSnapshot(day),
  ])

  return {
    date: day.toISOString().slice(0, 10),
    rooms: summarizeRooms(rooms),
    stays,
    fnb,
    combinedRevenue: roundMoney(stays.totalPaid + fnb.revenueTotal),
  }
}
