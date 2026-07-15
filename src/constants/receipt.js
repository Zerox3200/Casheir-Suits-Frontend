export const RECEIPT_WIDTH = {
  MM_58: '58mm',
  MM_80: '80mm',
}

export const RECEIPT_WIDTH_OPTIONS = [
  { value: RECEIPT_WIDTH.MM_58, label: '58mm' },
  { value: RECEIPT_WIDTH.MM_80, label: '80mm' },
]

/** Human-readable currency label for receipts (EGP → ج.م). */
export function formatCurrencyLabel(currency) {
  const map = {
    EGP: 'ج.م',
    USD: '$',
    EUR: '€',
    SAR: 'ر.س',
  }
  const key = String(currency || 'EGP').toUpperCase()
  return map[key] || currency || 'ج.م'
}

export function formatReceiptMoney(value, currency = 'EGP') {
  const amount = new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value) || 0)
  return `${amount} ${formatCurrencyLabel(currency)}`
}

export function formatReceiptDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
