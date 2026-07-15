import React from 'react'
import { formatReceiptDate } from '../../constants/receipt'

/**
 * Invoice meta: number, date, cashier, customer.
 * Future-ready slots for customer address / extra meta.
 */
export default function ReceiptMeta({ invoice }) {
  const cashier =
    invoice?.createdBy?.name ||
    invoice?.cashierName ||
    '—'
  const customerName = invoice?.customerName?.trim()
  const customerPhone = invoice?.customerPhone?.trim()
  const customerAddress = invoice?.customerAddress?.trim()

  return (
    <section className="receipt-meta">
      <div className="receipt-row">
        <span className="receipt-row-label">رقم الفاتورة</span>
        <span className="receipt-row-value">{invoice?.invoiceNumber || '—'}</span>
      </div>
      <div className="receipt-row">
        <span className="receipt-row-label">التاريخ</span>
        <span className="receipt-row-value">
          {formatReceiptDate(invoice?.createdAt)}
        </span>
      </div>
      <div className="receipt-row">
        <span className="receipt-row-label">الكاشير</span>
        <span className="receipt-row-value">{cashier}</span>
      </div>
      {customerName ? (
        <div className="receipt-row">
          <span className="receipt-row-label">العميل</span>
          <span className="receipt-row-value">{customerName}</span>
        </div>
      ) : null}
      {customerPhone ? (
        <div className="receipt-row">
          <span className="receipt-row-label">هاتف العميل</span>
          <span className="receipt-row-value">{customerPhone}</span>
        </div>
      ) : null}
      <div className="receipt-future-slot">
        {customerAddress ? (
          <div className="receipt-row">
            <span className="receipt-row-label">عنوان العميل</span>
            <span className="receipt-row-value">{customerAddress}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
