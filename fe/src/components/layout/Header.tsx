export function Header() {
  return (
    <header className="border-b border-hms-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-hms-navy text-hms-gold font-display text-lg font-semibold"
            aria-hidden="true"
          >
            H
          </div>
          <div className="text-left">
            <p className="font-display text-lg font-semibold leading-tight text-hms-navy">
              GrandStay HMS
            </p>
            <p className="text-xs text-hms-muted">Hotel Management System</p>
          </div>
        </div>
        <span className="hidden rounded-full bg-hms-cream px-3 py-1 text-xs font-medium text-hms-navy sm:inline-block">
          Staff Portal
        </span>
      </div>
    </header>
  )
}
