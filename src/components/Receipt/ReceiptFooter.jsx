import React from 'react'

/**
 * Footer text from settings + optional future QR / barcode slots.
 */
export default function ReceiptFooter({
  footerText,
  /** Reserved for future barcode/QR nodes */
  extras = null,
}) {
  return (
    <footer className="receipt-footer">
      {footerText ? <p className="receipt-muted">{footerText}</p> : null}
      <div className="receipt-future-slot">{extras}</div>
    </footer>
  )
}
