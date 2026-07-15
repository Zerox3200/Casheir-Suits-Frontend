import { formatCurrencyLabel, formatReceiptMoney } from '../constants/receipt'

/** Numeric amount only (no currency suffix). */
export function formatAmount(value, { maximumFractionDigits = 0 } = {}) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits,
  }).format(value ?? 0)
}

/**
 * Amount + currency label from settings code (EGP → ج.م).
 * Prefer `useFormatMoney()` in components so the label stays in sync.
 */
export function formatMoney(value, currency = 'EGP') {
  return formatReceiptMoney(value, currency)
}

export { formatCurrencyLabel, formatReceiptMoney }
