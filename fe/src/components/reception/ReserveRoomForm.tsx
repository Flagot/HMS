import { useMemo, useState, type FormEvent } from 'react'
import type { CreateReservationInput, ReceptionRoom } from '../../types/reservation'
import { formatMoney, roundMoney } from '../../utils/money'

type PaymentChoice = 'unpaid' | 'paid' | 'partial'

type ReserveRoomFormProps = {
  room: ReceptionRoom
  initialCheckIn?: string
  initialCheckOut?: string
  isSubmitting: boolean
  onSubmit: (input: CreateReservationInput) => Promise<void>
  onCancel: () => void
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function countNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T12:00:00`)
  const end = new Date(`${checkOut}T12:00:00`)
  const nights = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  return Math.max(1, nights)
}

export function ReserveRoomForm({
  room,
  initialCheckIn,
  initialCheckOut,
  isSubmitting,
  onSubmit,
  onCancel,
}: ReserveRoomFormProps) {
  const today = toDateInputValue(new Date())
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = toDateInputValue(tomorrowDate)

  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [checkInDate, setCheckInDate] = useState(initialCheckIn || today)
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut || tomorrow)
  const [adults, setAdults] = useState(1)
  const [note, setNote] = useState('')
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('unpaid')
  const [partialPaid, setPartialPaid] = useState('')

  const nights = useMemo(
    () => countNights(checkInDate, checkOutDate),
    [checkInDate, checkOutDate],
  )
  const totalAmount = useMemo(
    () => roundMoney(room.ratePerNight * nights),
    [room.ratePerNight, nights],
  )

  const amountPaid = useMemo(() => {
    if (paymentChoice === 'unpaid') return 0
    if (paymentChoice === 'paid') return totalAmount
    const value = Number(partialPaid)
    if (!Number.isFinite(value) || value < 0) return 0
    return roundMoney(Math.min(value, totalAmount))
  }, [paymentChoice, partialPaid, totalAmount])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await onSubmit({
        guestName: guestName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        roomType: room.type,
        roomId: room.id,
        // Anchor to UTC noon so the calendar day never shifts across timezones.
        checkInDate: `${checkInDate}T12:00:00.000Z`,
        checkOutDate: `${checkOutDate}T12:00:00.000Z`,
        adults,
        note: note.trim() || undefined,
        amountPaid,
      })
    } catch {
      // Parent surfaces error.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-hms-border pt-5">
      <h3 className="font-display text-lg font-semibold text-hms-navy">
        Reserve room {room.number}
      </h3>
      <p className="mt-1 text-sm text-hms-muted">
        {room.name} · {formatMoney(room.ratePerNight)}/night · max {room.capacity} guests
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-hms-navy">Guest name</span>
          <input
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Phone (optional)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Email (optional)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Check-in</span>
          <input
            type="date"
            required
            min={today}
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Check-out</span>
          <input
            type="date"
            required
            min={checkInDate}
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Adults</span>
          <input
            type="number"
            min={1}
            max={room.capacity}
            required
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-hms-navy">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Late arrival, extra pillows…"
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-hms-border bg-hms-cream/40 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-hms-navy">Stay total</p>
          <p className="text-sm text-hms-muted">
            {nights} night{nights > 1 ? 's' : ''} × {formatMoney(room.ratePerNight)} ={' '}
            <span className="font-semibold text-hms-navy">{formatMoney(totalAmount)}</span>
          </p>
        </div>

        <fieldset className="mt-3">
          <legend className="mb-2 text-sm font-medium text-hms-navy">Payment</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['unpaid', 'Unpaid'],
                ['paid', 'Fully paid'],
                ['partial', 'Partial'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  paymentChoice === value
                    ? 'border-hms-navy bg-hms-navy text-white'
                    : 'border-hms-border bg-white text-hms-navy hover:bg-white/80'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={paymentChoice === value}
                  onChange={() => setPaymentChoice(value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {paymentChoice === 'partial' ? (
          <label className="mt-3 block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Amount paid</span>
            <input
              type="number"
              min={0}
              max={totalAmount}
              step={0.01}
              required
              value={partialPaid}
              onChange={(e) => setPartialPaid(e.target.value)}
              placeholder={`0 – ${totalAmount}`}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
        ) : null}

        <p className="mt-3 text-xs text-hms-muted">
          Recording {formatMoney(amountPaid)} paid · balance{' '}
          {formatMoney(roundMoney(Math.max(0, totalAmount - amountPaid)))}
        </p>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hms-border px-4 py-2 text-sm font-medium text-hms-navy"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
        >
          {isSubmitting ? 'Reserving…' : 'Confirm reservation'}
        </button>
      </div>
    </form>
  )
}
