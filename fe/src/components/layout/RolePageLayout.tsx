import type { ReactNode } from 'react'
import { PageHeader } from '../ui/PageHeader'
import { PageSidebar, type PageSidebarItem } from './PageSidebar'

type RolePageLayoutProps = {
  roleLabel: string
  title: string
  subtitle: string
  navLabel: string
  navTitle?: string
  items: PageSidebarItem[]
  activeId: string
  onSelect: (id: string) => void
  children: ReactNode
  banner?: ReactNode
}

export function RolePageLayout({
  roleLabel,
  title,
  subtitle,
  navLabel,
  navTitle,
  items,
  activeId,
  onSelect,
  children,
  banner,
}: RolePageLayoutProps) {
  return (
    <div className="flex min-h-[calc(100svh-4.5rem)] flex-col lg:flex-row">
      <PageSidebar
        items={items}
        activeId={activeId}
        onSelect={onSelect}
        ariaLabel={navLabel}
        title={navTitle}
      />

      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <PageHeader roleLabel={roleLabel} title={title} subtitle={subtitle} />
          {banner}
          {children}
        </div>
      </div>
    </div>
  )
}
