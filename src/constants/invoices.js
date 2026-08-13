export const INVOICE_STATUS = {
  COMPLETED: 'مكتملة',
  RETURNED: 'مرتجعة',
}

export const PAYMENT_METHODS = {
  CASH: 'نقدي',
  VISA: 'فيزا',
}

export const clampDiscountPercent = (value) => {
  const n = Number(value)
  if (Number.isNaN(n) || n < 0) return 0
  if (n > 100) return 100
  return n
}

export const discountAmountFromPercent = (subTotal, percent) => {
  const amount =
    (Number(subTotal) || 0) * (clampDiscountPercent(percent) / 100)
  return Math.round(amount * 100) / 100
}
