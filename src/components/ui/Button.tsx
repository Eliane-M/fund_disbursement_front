import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'dark' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-amber-500 text-navy-900 hover:bg-amber-400 focus-visible:outline-amber-600 disabled:bg-amber-300',
  dark: 'bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-700 disabled:bg-navy-500',
  ghost:
    'bg-transparent text-navy-700 hover:bg-navy-900/5 focus-visible:outline-navy-300 disabled:text-navy-400',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, fullWidth = true, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
