import { useEffect, useRef } from 'react'
import type { MenuItem, Order } from '../types/order'

type OrderChangeHandler = (change: {
  order: Order
  previousStatus?: Order['status']
  isNew: boolean
}) => void

type MenuChangeHandler = (change: {
  item: MenuItem
  previousAvailable: boolean
}) => void

/** Compare polled orders against the previous snapshot and emit meaningful status changes. */
export function detectOrderChanges(
  previous: Order[],
  next: Order[],
  onChange: OrderChangeHandler,
) {
  const prevMap = new Map(previous.map((order) => [order.id, order]))

  for (const order of next) {
    const older = prevMap.get(order.id)
    if (!older) {
      onChange({ order, isNew: true })
      continue
    }
    if (older.status !== order.status) {
      onChange({ order, previousStatus: older.status, isNew: false })
    }
  }
}

export function detectMenuAvailabilityChanges(
  previous: MenuItem[],
  next: MenuItem[],
  onChange: MenuChangeHandler,
) {
  const prevMap = new Map(previous.map((item) => [item.id, item]))

  for (const item of next) {
    const older = prevMap.get(item.id)
    if (!older) continue
    if (older.available !== item.available) {
      onChange({ item, previousAvailable: older.available })
    }
  }
}

type UseIntervalOptions = {
  enabled?: boolean
  immediate?: boolean
}

export function useInterval(
  callback: () => void | Promise<void>,
  delayMs: number,
  options: UseIntervalOptions = {},
) {
  const { enabled = true, immediate = false } = options
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function tick() {
      if (cancelled) return
      await savedCallback.current()
    }

    if (immediate) void tick()

    const id = window.setInterval(() => {
      void tick()
    }, delayMs)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [delayMs, enabled, immediate])
}
