import type { ReactNode } from 'react'

export type PageSidebarItem = {
  id: string
  label: string
  badge?: ReactNode
}

type PageSidebarProps = {
  items: PageSidebarItem[]
  activeId: string
  onSelect: (id: string) => void
  ariaLabel: string
  title?: string
}

export function PageSidebar({
  items,
  activeId,
  onSelect,
  ariaLabel,
  title = 'Navigate',
}: PageSidebarProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className="shrink-0 border-b border-hms-border bg-white/90 lg:sticky lg:top-[4.5rem] lg:h-[calc(100svh-4.5rem)] lg:w-56 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:bg-white"
    >
      <p className="hidden px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-hms-muted lg:block">
        {title}
      </p>

      <div
        role="tablist"
        aria-orientation="vertical"
        className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6 lg:pt-1"
      >
        {items.map((item) => {
          const active = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(item.id)}
              className={`inline-flex shrink-0 items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors lg:w-full ${
                active
                  ? 'bg-hms-navy text-white shadow-sm'
                  : 'text-hms-slate hover:bg-hms-cream hover:text-hms-navy'
              }`}
            >
              <span>{item.label}</span>
              {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
