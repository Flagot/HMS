export function formatMoney(amount: number): string {
  return `${amount.toFixed(2)} ETB`
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 1000) / 10}%`
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Live preview totals while building/editing an order (uses current menu prices). */
export function previewOrderTotals(
  quantities: Record<string, number>,
  menuById: Map<string, { price: number }>,
  taxRate = 0.15,
  serviceChargeRate = 0.1,
) {
  const subtotal = roundMoney(
    Object.entries(quantities).reduce((sum, [id, quantity]) => {
      const price = menuById.get(id)?.price ?? 0
      return sum + price * quantity
    }, 0),
  )
  const tax = roundMoney(subtotal * taxRate)
  const serviceCharge = roundMoney(subtotal * serviceChargeRate)
  const total = roundMoney(subtotal + tax + serviceCharge)

  return { subtotal, tax, serviceCharge, total, taxRate, serviceChargeRate }
}
