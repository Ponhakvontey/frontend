const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim())
}

export function validateRequired(value: string, fieldLabel: string) {
  if (!value.trim()) return `${fieldLabel} is required.`
  return ''
}

export function validateEmail(value: string) {
  const requiredError = validateRequired(value, 'Email')
  if (requiredError) return requiredError
  if (!isValidEmail(value)) return 'Please enter a valid email address.'
  return ''
}

// Must match the backend RegisterRequest @Pattern exactly
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

export function validatePassword(value: string) {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter.'
  if (!/[a-z]/.test(value)) return 'Password must include at least one lowercase letter.'
  if (!/\d/.test(value)) return 'Password must include at least one number.'
  if (!passwordPattern.test(value)) return 'Password must include at least one special character (e.g. !@#$%).'
  return ''
}

export function validateConfirmPassword(password: string, confirmPassword: string) {
  if (!confirmPassword) return 'Please confirm your password.'
  if (confirmPassword !== password) return 'Passwords do not match.'
  return ''
}

export function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

export function isValidZipCode(zipCode: string) {
  return /^\d{5}(-\d{4})?$/.test(zipCode.trim())
}

export function isValidCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\s/g, '')
  return /^\d{16}$/.test(digits)
}

export function isValidExpiry(expiry: string) {
  const match = expiry.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/)
  if (!match) return false

  const month = Number(match[1])
  const year = Number(match[2])
  if (month < 1 || month > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  return true
}

export function isValidCvv(cvv: string) {
  return /^\d{3,4}$/.test(cvv.trim())
}
