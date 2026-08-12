type PageHeaderProps = {
  title: string
  subtitle: string
  roleLabel: string
}

export function PageHeader({ title, subtitle, roleLabel }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-hms-gold">
        {roleLabel}
      </p>
      <h1 className="font-display text-3xl font-semibold text-hms-navy sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-base text-hms-muted">{subtitle}</p>
    </div>
  )
}
