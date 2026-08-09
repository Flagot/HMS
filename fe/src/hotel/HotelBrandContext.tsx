import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { API_BASE_URL } from '../api/client'

const DEFAULT_HOTEL_NAME = 'GrandStay'

type HotelBrandContextValue = {
  hotelName: string
  refreshHotelName: () => Promise<void>
}

const HotelBrandContext = createContext<HotelBrandContextValue>({
  hotelName: DEFAULT_HOTEL_NAME,
  refreshHotelName: async () => {},
})

export function HotelBrandProvider({ children }: { children: ReactNode }) {
  const [hotelName, setHotelName] = useState(DEFAULT_HOTEL_NAME)

  const refreshHotelName = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel`, {
        credentials: 'include',
      })
      if (!response.ok) return
      const body = (await response.json()) as { hotelName?: string }
      if (typeof body.hotelName === 'string' && body.hotelName.trim()) {
        setHotelName(body.hotelName.trim())
      }
    } catch {
      // Keep current / default name if the API is unreachable.
    }
  }, [])

  useEffect(() => {
    void refreshHotelName()
  }, [refreshHotelName])

  useEffect(() => {
    document.title = hotelName
  }, [hotelName])

  return (
    <HotelBrandContext.Provider value={{ hotelName, refreshHotelName }}>
      {children}
    </HotelBrandContext.Provider>
  )
}

export function useHotelBrand() {
  return useContext(HotelBrandContext)
}
