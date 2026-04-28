const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim())
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
