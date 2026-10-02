import { useRef } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: boolean
  autoFocus?: boolean
}

export function OtpInput({ value, onChange, length = 6, error, autoFocus }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  function setDigit(index: number, digit: string) {
    const next = digits.slice()
    next[index] = digit
    onChange(next.join(''))
  }

  function handleChange(index: number, raw: string) {
    const clean = raw.replace(/\D/g, '')
    if (!clean) {
      setDigit(index, '')
      return
    }
    if (clean.length > 1) {
      const next = value.split('')
      clean.split('').forEach((char, offset) => {
        next[index + offset] = char
      })
      onChange(next.join('').slice(0, length))
      const nextIndex = Math.min(index + clean.length, length - 1)
      inputsRef.current[nextIndex]?.focus()
      return
    }
    setDigit(index, clean)
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          autoFocus={autoFocus && index === 0}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e.key)}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={`h-12 w-11 rounded-lg border bg-white text-center text-lg font-semibold text-navy-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60 sm:w-12 ${
            error ? 'border-danger-text/60' : 'border-cream-300 focus:border-amber-400'
          }`}
        />
      ))}
    </div>
  )
}
