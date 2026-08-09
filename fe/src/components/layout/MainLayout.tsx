import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { authClient } from '../../lib/auth-client'

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const { data: session } = authClient.useSession()
  const isLanding = location.pathname === '/' && !session?.user
  const isLogin = location.pathname === '/login'

  return (
    <div
      className={
        isLanding
          ? 'flex min-h-svh flex-col bg-hms-navy'
          : isLogin
            ? 'flex h-svh flex-col overflow-hidden bg-hms-cream'
            : 'flex min-h-svh flex-col bg-hms-cream'
      }
    >
      <Header />
      <main className={isLogin ? 'flex min-h-0 flex-1 flex-col' : 'flex-1'}>
        {children}
      </main>
      {!isLanding && !isLogin ? <Footer /> : null}
    </div>
  )
}
