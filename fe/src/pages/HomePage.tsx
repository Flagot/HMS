import { RoleCard } from '../components/ui/RoleCard'
import { staffRoles } from '../data/roles'

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section className="mb-10 text-center sm:mb-14">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-hms-gold">
          Welcome
        </p>
        <h1 className="font-display text-3xl font-semibold text-hms-navy sm:text-4xl lg:text-5xl">
          Select Your Role
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-hms-muted sm:text-lg">
          Choose your staff profile to access the tools and dashboards designed for your
          department. Each portal is tailored to your daily workflow.
        </p>
      </section>

      <section
        aria-label="Staff role portals"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {staffRoles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </section>
    </div>
  )
}
