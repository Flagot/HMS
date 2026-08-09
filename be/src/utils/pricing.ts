function parseRate(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

/** Tax rate as a decimal, e.g. 0.15 = 15% */
export function getTaxRate(): number {
  return parseRate(process.env.TAX_RATE, 0.15)
}

/** Service charge rate as a decimal, e.g. 0.1 = 10% */
export function getServiceChargeRate(): number {
  return parseRate(process.env.SERVICE_CHARGE_RATE, 0.1)
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export type OrderTotals = {
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
  taxRate: number
  serviceChargeRate: number
}

export function calculateOrderTotals(subtotalInput: number): OrderTotals {
  const subtotal = roundMoney(subtotalInput)
  const taxRate = getTaxRate()
  const serviceChargeRate = getServiceChargeRate()
  const tax = roundMoney(subtotal * taxRate)
  const serviceCharge = roundMoney(subtotal * serviceChargeRate)
  const total = roundMoney(subtotal + tax + serviceCharge)

  return {
    subtotal,
    tax,
    serviceCharge,
    total,
    taxRate,
    serviceChargeRate,
  }
}
