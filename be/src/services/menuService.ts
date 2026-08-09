import { menuCatalog } from '../data/menuCatalog.js'
import { MenuItem, type IMenuItem } from '../models/MenuItem.js'
import type { MenuItemResponse } from '../types/menu.js'

export function toMenuItemResponse(item: IMenuItem): MenuItemResponse {
  return {
    id: item.itemId,
    name: item.name,
    category: item.category,
    meals: item.meals,
    price: item.price,
    available: item.available,
  }
}

export async function ensureMenuSeeded(): Promise<void> {
  const count = await MenuItem.countDocuments()
  if (count > 0) return

  await MenuItem.insertMany(
    menuCatalog.map((item) => ({
      itemId: item.id,
      name: item.name,
      category: item.category,
      meals: item.meals,
      price: item.price,
      available: item.available,
    })),
  )
}

export async function listMenuItems(): Promise<MenuItemResponse[]> {
  await ensureMenuSeeded()
  const items = await MenuItem.find().sort({ category: 1, name: 1 })
  return items.map(toMenuItemResponse)
}

export async function getMenuItemMap(): Promise<Map<string, IMenuItem>> {
  await ensureMenuSeeded()
  const items = await MenuItem.find()
  return new Map(items.map((item) => [item.itemId, item]))
}
