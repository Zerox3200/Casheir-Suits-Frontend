import React from 'react'
import { RECEIPT_WIDTH } from '../../constants/receipt'
import ReceiptHeader from './ReceiptHeader'
import ReceiptMeta from './ReceiptMeta'
import ReceiptItems from './ReceiptItems'
import ReceiptTotals from './ReceiptTotals'
import ReceiptFooter from './ReceiptFooter'
import './receipt.css'

/**
 * Isolated thermal receipt layout (HTML/CSS print only).
 * Screen preview uses the same markup as print.
 */
export default function ReceiptLayout({
  invoice,
  settings,
  width,
}) {
  const paperWidth =
    width ||
    settings?.receiptWidth ||
    RECEIPT_WIDTH.MM_80
  const currency = settings?.currency || 'EGP'
  const items = invoice?.items ?? []

  return (
    <article
      className="receipt-paper"
      data-width={paperWidth}
      style={{ '--receipt-width': paperWidth }}
      dir="rtl"
      lang="ar"
    >
      <ReceiptHeader settings={settings} />
      <hr className="receipt-sep" />
      <ReceiptMeta invoice={invoice} />
      <hr className="receipt-sep" />
      <ReceiptItems items={items} currency={currency} />
      <hr className="receipt-sep" />
      <ReceiptTotals invoice={invoice} currency={currency} />
      <hr className="receipt-sep" />
      <ReceiptFooter footerText={settings?.receiptFooter} />
    </article>
  )
}
