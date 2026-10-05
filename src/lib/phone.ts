/** 10 digits, or a leading + followed by 12 digits. A blank value is allowed. */
const PHONE_PATTERN = /^(?:\d{10}|\+\d{12})$/

export const PHONE_HINT = '10 digits, or + followed by 12 digits.'

export const PHONE_ERROR = 'The phone number must be 10 digits, or a + followed by 12 digits.'

export function phoneValidationError(value: string): string | null {
  const phone = value.trim()
  if (!phone || PHONE_PATTERN.test(phone)) return null
  return PHONE_ERROR
}
