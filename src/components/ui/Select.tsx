import { type SelectHTMLAttributes, forwardRef, useId } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, className = '', children, ...props }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const hintId = hint ? `${fieldId}-hint` : undefined
    const errorId = error ? `${fieldId}-error` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-navy-800">
          {label}
        </label>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId ?? hintId}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
            error ? 'border-danger-text/60' : 'border-cream-300 focus:border-amber-400'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <p id={hintId} className="text-xs text-navy-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-danger-text">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'
