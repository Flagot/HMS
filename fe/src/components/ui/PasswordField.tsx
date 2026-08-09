import { useState, type InputHTMLAttributes } from 'react'

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label?: string
}

export function PasswordField({
  label = 'Password',
  className,
  id,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? props.name ?? 'password'

  return (
    <label className="block text-sm" htmlFor={inputId}>
      <span className="mb-1.5 block font-medium text-hms-navy">{label}</span>
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={
            className ??
            'w-full rounded-lg border border-hms-border bg-white py-2 pr-16 pl-3 text-sm outline-none focus:border-hms-navy'
          }
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-hms-muted hover:text-hms-navy"
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </label>
  )
}
