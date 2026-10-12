/** Нормализуем номер под checkAccount: только цифры, 11–12 знаков. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '')

  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }

  return digits
}

export function isValidPhone(digits: string): boolean {
  return digits.length === 11 || digits.length === 12
}

export function formatPhoneDisplay(digits: string): string {
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }

  if (digits.length === 12 && digits.startsWith('375')) {
    return `+375 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
  }

  return digits ? `+${digits}` : ''
}

export function phoneToNumber(digits: string): number {
  return Number(digits)
}
