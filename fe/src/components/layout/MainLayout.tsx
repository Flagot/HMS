import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-hms-cream">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
