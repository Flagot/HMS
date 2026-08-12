import { useHotelBrand } from '../../hotel/HotelBrandContext'

export function Footer() {
  const { hotelName } = useHotelBrand()

  return (
    <footer className="mt-auto border-t border-hms-border bg-white/80">
      <div className="mx-auto max-w-[90rem] px-4 py-5 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-hms-muted">
          &copy; {new Date().getFullYear()} {hotelName}. Internal staff use
          only.
        </p>
      </div>
    </footer>
  )
}
