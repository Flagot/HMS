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
const STORAGE_KEY = 'hms.hotelName'

function readStoredHotelName(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored?.trim()) return stored.trim()
  } catch {
    // Ignore storage errors (private mode, etc.).
  }
  return DEFAULT_HOTEL_NAME
}

function writeStoredHotelName(name: string) {
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    // Ignore storage errors.
  }
}

type HotelBrandContextValue = {
  hotelName: string
  setHotelName: (name: string) => void
  refreshHotelName: () => Promise<void>
}

const HotelBrandContext = createContext<HotelBrandContextValue>({
  hotelName: DEFAULT_HOTEL_NAME,
  setHotelName: () => {},
  refreshHotelName: async () => {},
})

export function HotelBrandProvider({ children }: { children: ReactNode }) {
  const [hotelName, setHotelNameState] = useState(readStoredHotelName)

  const setHotelName = useCallback((name: string) => {
    const next = name.trim() || DEFAULT_HOTEL_NAME
    setHotelNameState(next)
    writeStoredHotelName(next)
  }, [])

  const refreshHotelName = useCallback(async () => {
    if (!API_BASE_URL) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel`, {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!response.ok) return
      const body = (await response.json()) as { hotelName?: string }
      if (typeof body.hotelName === 'string' && body.hotelName.trim()) {
        setHotelName(body.hotelName)
      }
    } catch {
      // Keep current / stored name if the API is unreachable.
    }
  }, [setHotelName])

  useEffect(() => {
    void refreshHotelName()
  }, [refreshHotelName])

  useEffect(() => {
    document.title = hotelName
  }, [hotelName])

  return (
    <HotelBrandContext.Provider
      value={{ hotelName, setHotelName, refreshHotelName }}
    >
      {children}
    </HotelBrandContext.Provider>
  )
}

export function useHotelBrand() {
  return useContext(HotelBrandContext)
}
