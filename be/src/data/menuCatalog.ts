export type MenuCategory = 'drinks' | 'food' | 'sides' | 'dessert'
export type MenuMeal = 'breakfast' | 'lunch' | 'dinner'

export type MenuCatalogItem = {
  id: string
  name: string
  category: MenuCategory
  meals: MenuMeal[]
  price: number
  available: boolean
}

/** Default catalog used to seed MongoDB. Prices in ETB. */
export const menuCatalog: MenuCatalogItem[] = [
  {
    id: 'orange-juice',
    name: 'Orange Juice',
    category: 'drinks',
    meals: ['breakfast', 'lunch'],
    price: 45,
    available: true,
  },
  {
    id: 'coffee',
    name: 'Coffee',
    category: 'drinks',
    meals: ['breakfast', 'lunch', 'dinner'],
    price: 35,
    available: true,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'drinks',
    meals: ['breakfast', 'lunch'],
    price: 55,
    available: true,
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    category: 'drinks',
    meals: ['lunch', 'dinner'],
    price: 40,
    available: true,
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    category: 'drinks',
    meals: ['lunch', 'dinner'],
    price: 40,
    available: true,
  },
  {
    id: 'sparkling-water',
    name: 'Sparkling Water',
    category: 'drinks',
    meals: ['lunch', 'dinner'],
    price: 30,
    available: true,
  },
  {
    id: 'still-water',
    name: 'Still Water',
    category: 'drinks',
    meals: ['breakfast', 'lunch', 'dinner'],
    price: 25,
    available: true,
  },
  {
    id: 'house-red-wine',
    name: 'House Red Wine',
    category: 'drinks',
    meals: ['dinner'],
    price: 180,
    available: true,
  },
  {
    id: 'eggs-benedict',
    name: 'Eggs Benedict',
    category: 'food',
    meals: ['breakfast'],
    price: 160,
    available: true,
  },
  {
    id: 'club-sandwich',
    name: 'Club Sandwich',
    category: 'food',
    meals: ['lunch'],
    price: 190,
    available: true,
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    category: 'food',
    meals: ['lunch', 'dinner'],
    price: 150,
    available: true,
  },
  {
    id: 'tomato-soup',
    name: 'Tomato Soup',
    category: 'food',
    meals: ['lunch', 'dinner'],
    price: 95,
    available: true,
  },
  {
    id: 'cheeseburger',
    name: 'Cheeseburger',
    category: 'food',
    meals: ['lunch'],
    price: 220,
    available: true,
  },
  {
    id: 'pasta-carbonara',
    name: 'Pasta Carbonara',
    category: 'food',
    meals: ['lunch', 'dinner'],
    price: 240,
    available: true,
  },
  {
    id: 'grilled-salmon',
    name: 'Grilled Salmon',
    category: 'food',
    meals: ['dinner'],
    price: 380,
    available: true,
  },
  {
    id: 'croissant-platter',
    name: 'Croissant Platter',
    category: 'sides',
    meals: ['breakfast'],
    price: 120,
    available: true,
  },
  {
    id: 'fruit-bowl',
    name: 'Fruit Bowl',
    category: 'sides',
    meals: ['breakfast', 'lunch'],
    price: 90,
    available: true,
  },
  {
    id: 'fries',
    name: 'Fries',
    category: 'sides',
    meals: ['lunch', 'dinner'],
    price: 70,
    available: true,
  },
]
