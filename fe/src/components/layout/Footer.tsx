import { useHotelBrand } from '../../hotel/HotelBrandContext'

export function Footer() {
  const { hotelName } = useHotelBrand()

  return (
    <footer className="mt-auto border-t border-hms-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-hms-muted">
          &copy; {new Date().getFullYear()} {hotelName}. Internal staff use
          only.
        </p>
      </div>
    </footer>
  )
}
