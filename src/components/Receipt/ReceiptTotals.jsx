import React from 'react'
import { formatReceiptMoney } from '../../constants/receipt'

/**
 * Subtotal / discount / tax / grand total + payment method.
 * Future-ready: multiple payment methods array.
 */
export default function ReceiptTotals({ invoice, currency = 'EGP' }) {
  const payments = Array.isArray(invoice?.payments)
    ? invoice.payments
    : invoice?.paymentMethod
      ? [{ method: invoice.paymentMethod, amount: invoice.total }]
      : []

  return (
    <section className="receipt-totals">
      <div className="receipt-row">
        <span className="receipt-row-label">المجموع الفرعي</span>
        <span className="receipt-row-value">
          {formatReceiptMoney(invoice?.subTotal, currency)}
        </span>
      </div>
      {Number(invoice?.discount) > 0 ? (
        <div className="receipt-row">
          <span className="receipt-row-label">
            الخصم
            {Number(invoice?.discountPercent) > 0
              ? ` (${invoice.discountPercent}%)`
              : ''}
          </span>
          <span className="receipt-row-value">
            {formatReceiptMoney(invoice.discount, currency)}
          </span>
        </div>
      ) : null}
      {Number(invoice?.tax) > 0 ? (
        <div className="receipt-row">
          <span className="receipt-row-label">الضريبة</span>
          <span className="receipt-row-value">
            {formatReceiptMoney(invoice.tax, currency)}
          </span>
        </div>
      ) : null}
      <div className="receipt-row receipt-total-strong">
        <span className="receipt-row-label">الإجمالي</span>
        <span className="receipt-row-value">
          {formatReceiptMoney(invoice?.total, currency)}
        </span>
      </div>

      <hr className="receipt-sep" />

      {payments.length <= 1 ? (
        <div className="receipt-row">
          <span className="receipt-row-label">طريقة الدفع</span>
          <span className="receipt-row-value">
            {payments[0]?.method || invoice?.paymentMethod || '—'}
          </span>
        </div>
      ) : (
        payments.map((p, i) => (
          <div key={`${p.method}-${i}`} className="receipt-row">
            <span className="receipt-row-label">{p.method || 'دفع'}</span>
            <span className="receipt-row-value">
              {formatReceiptMoney(p.amount, currency)}
            </span>
          </div>
        ))
      )}
    </section>
  )
}
