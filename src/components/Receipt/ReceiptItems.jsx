import React from 'react'
import { formatReceiptMoney } from '../../constants/receipt'

/**
 * Line items table for thermal receipt.
 */
export default function ReceiptItems({ items = [], currency = 'EGP' }) {
  if (!items.length) {
    return <p className="receipt-center receipt-muted">لا توجد أصناف</p>
  }

  return (
    <section>
      <div className="receipt-items-head" aria-hidden="true">
        <span>الصنف</span>
        <span>الكمية</span>
        <span>السعر</span>
        <span>الإجمالي</span>
      </div>
      {items.map((item, index) => {
        const key = item._id || `${item.productId || item.sku || 'item'}-${index}`
        const qty = item.quantity ?? 0
        const unit = item.unitPrice ?? 0
        const line =
          item.lineTotal != null ? item.lineTotal : Number(unit) * Number(qty)

        return (
          <div key={key} className="receipt-item">
            <div className="receipt-item-name">{item.name || '—'}</div>
            {(item.sku || item.barcode) && (
              <div className="receipt-item-meta">
                {[item.sku, item.barcode].filter(Boolean).join(' · ')}
              </div>
            )}
            <div className="receipt-item-cols">
              <span />
              <span>{qty}</span>
              <span>{formatReceiptMoney(unit, currency)}</span>
              <span>{formatReceiptMoney(line, currency)}</span>
            </div>
          </div>
        )
      })}
    </section>
  )
}
