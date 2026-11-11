import { type InputHTMLAttributes, forwardRef, useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './icons'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, id, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const hintId = hint ? `${fieldId}-hint` : undefined
    const errorId = error ? `${fieldId}-error` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-navy-800">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={isPassword && showPassword ? 'text' : type}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId ?? hintId}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
              error ? 'border-danger-text/60' : 'border-cream-300 focus:border-amber-400'
            } ${isPassword ? 'pr-11' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-navy-400 hover:text-navy-700 focus:outline-none focus-visible:text-navy-700"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
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
TextField.displayName = 'TextField'
