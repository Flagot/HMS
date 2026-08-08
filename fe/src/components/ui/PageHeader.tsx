import { Link } from 'react-router-dom'

type PageHeaderProps = {
  title: string
  subtitle: string
  roleLabel: string
  backTo?: string
}

export function PageHeader({
  title,
  subtitle,
  roleLabel,
  backTo = '/',
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm font-medium text-hms-muted transition-colors hover:text-hms-navy"
      >
        <span aria-hidden="true">←</span> Back to roles
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-widest text-hms-gold">
            {roleLabel}
          </p>
          <h1 className="font-display text-3xl font-semibold text-hms-navy sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-hms-muted">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
