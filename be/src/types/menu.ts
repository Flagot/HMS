export type MenuItemResponse = {
  id: string
  name: string
  category: 'drinks' | 'food' | 'sides' | 'dessert'
  meals: Array<'breakfast' | 'lunch' | 'dinner'>
  price: number
  available: boolean
}
