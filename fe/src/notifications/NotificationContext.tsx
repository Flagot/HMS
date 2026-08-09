import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { NotificationStack } from './NotificationStack'

export type NoticeTone = 'info' | 'success' | 'warn' | 'error'

export type Notice = {
  id: string
  title: string
  message: string
  tone: NoticeTone
}

type NotificationContextValue = {
  pushNotice: (input: Omit<Notice, 'id'>) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

type NotificationProviderProps = {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notices, setNotices] = useState<Notice[]>([])

  const dismissNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((notice) => notice.id !== id))
  }, [])

  const pushNotice = useCallback((input: Omit<Notice, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setNotices((prev) => [...prev, { ...input, id }])
    window.setTimeout(() => {
      setNotices((prev) => prev.filter((notice) => notice.id !== id))
    }, 6500)
  }, [])

  const value = useMemo(() => ({ pushNotice }), [pushNotice])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationStack notices={notices} onDismiss={dismissNotice} />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
