import { useState, type FormEvent } from 'react'
import type { Room, RoomType } from '../../types/room'
import {
  ROOM_TYPE_OPTIONS,
  roomStatusLabel,
  roomTypeLabel,
  type CreateAdminRoomInput,
  type UpdateAdminRoomInput,
} from '../../types/admin'
import { formatMoney } from '../../utils/money'

type AdminRoomsTabProps = {
  rooms: Room[]
  loading?: boolean
  saving?: boolean
  onCreate: (input: CreateAdminRoomInput) => Promise<void>
  onUpdate: (id: string, input: UpdateAdminRoomInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function AdminRoomsTab({
  rooms,
  loading = false,
  saving = false,
  onCreate,
  onUpdate,
  onDelete,
}: AdminRoomsTabProps) {
  const [number, setNumber] = useState('')
  const [floor, setFloor] = useState('1')
  const [type, setType] = useState<RoomType>('standard')
  const [name, setName] = useState('')
  const [ratePerNight, setRatePerNight] = useState('')
  const [capacity, setCapacity] = useState('2')
  const [bedType, setBedType] = useState('Queen')
  const [sizeSqm, setSizeSqm] = useState('22')
  const [amenities, setAmenities] = useState('Wi-Fi, TV, Air conditioning')
  const [description, setDescription] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState('')
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<RoomType>('standard')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const floorNum = Number(floor)
    const rate = Number(ratePerNight || 0)
    const cap = Number(capacity)
    const size = Number(sizeSqm)
    if (!number.trim()) return
    if (!Number.isFinite(floorNum) || floorNum < 1) return
    if (!Number.isFinite(rate) || rate < 0) return

    try {
      await onCreate({
        number: number.trim(),
        floor: floorNum,
        type,
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        amenities: amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        capacity: Number.isFinite(cap) && cap >= 1 ? cap : 2,
        bedType: bedType.trim() || 'Queen',
        sizeSqm: Number.isFinite(size) && size >= 1 ? size : 20,
        ratePerNight: rate,
      })
      setNumber('')
      setName('')
      setRatePerNight('')
      setDescription('')
    } catch {
      // Parent surfaces error.
    }
  }

  function startEdit(room: Room) {
    setEditingId(room.id)
    setEditRate(String(room.ratePerNight ?? 0))
    setEditName(room.name ?? '')
    setEditType(room.type)
  }

  async function saveEdit(room: Room) {
    const rate = Number(editRate)
    if (!Number.isFinite(rate) || rate < 0) return
    await onUpdate(room.id, {
      name: editName.trim() || undefined,
      type: editType,
      ratePerNight: rate,
    })
    setEditingId(null)
  }

  if (loading && rooms.length === 0) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading rooms…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Room catalog
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          Add rooms and keep rates, types, and names up to date. Housekeeping still
          owns cleaning status day to day.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-3 rounded-lg border border-hms-border bg-hms-cream/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Number</span>
            <input
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Floor</span>
            <input
              required
              type="number"
              min={1}
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RoomType)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              {ROOM_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Rate / night
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={ratePerNight}
              onChange={(e) => setRatePerNight(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium text-hms-navy">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Courtyard Standard"
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Capacity</span>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Bed</span>
            <input
              value={bedType}
              onChange={(e) => setBedType(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Size m²</span>
            <input
              type="number"
              min={1}
              value={sizeSqm}
              onChange={(e) => setSizeSqm(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Amenities (comma-separated)
            </span>
            <input
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-4">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Description
            </span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <div className="flex items-end lg:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
            >
              Add room
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-hms-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-hms-border bg-hms-cream/50 text-xs uppercase tracking-wide text-hms-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">HK status</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-hms-muted"
                  >
                    No rooms yet.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-hms-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      {editingId === room.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mb-1 w-full rounded border border-hms-border px-2 py-1 text-sm"
                        />
                      ) : (
                        <p className="font-medium text-hms-navy">
                          {room.name ?? `Room ${room.number}`}
                        </p>
                      )}
                      <p className="text-xs text-hms-muted">
                        #{room.number} · Floor {room.floor}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === room.id ? (
                        <select
                          value={editType}
                          onChange={(e) =>
                            setEditType(e.target.value as RoomType)
                          }
                          className="rounded border border-hms-border px-2 py-1 text-sm"
                        >
                          {ROOM_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-hms-muted">
                          {roomTypeLabel(room.type)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-hms-muted">
                      {roomStatusLabel(room.status)}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === room.id ? (
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-28 rounded border border-hms-border px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-hms-navy">
                          {formatMoney(room.ratePerNight ?? 0)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {editingId === room.id ? (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void saveEdit(room)}
                              className="rounded-lg bg-hms-navy px-2.5 py-1 text-xs font-medium text-white disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-hms-border px-2.5 py-1 text-xs font-medium text-hms-muted"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(room)}
                            className="rounded-lg border border-hms-border px-2.5 py-1 text-xs font-medium text-hms-navy hover:bg-hms-cream"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void onDelete(room.id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
