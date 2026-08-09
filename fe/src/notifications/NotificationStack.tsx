import type { Notice } from './NotificationContext'

const toneStyles: Record<Notice['tone'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  warn: 'border-amber-200 bg-amber-50 text-amber-950',
}

type NotificationStackProps = {
  notices: Notice[]
  onDismiss: (id: string) => void
}

export function NotificationStack({ notices, onDismiss }: NotificationStackProps) {
  if (notices.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {notices.map((notice) => (
        <div
          key={notice.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg ${toneStyles[notice.tone]}`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{notice.title}</p>
              <p className="mt-1 text-sm opacity-90">{notice.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(notice.id)}
              className="rounded-md px-1.5 text-sm opacity-70 transition-opacity hover:opacity-100"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
