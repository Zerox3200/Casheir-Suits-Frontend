import React from 'react'
import { resolveMediaUrl } from '../../helpers/Api'

/**
 * Store brand block at the top of the thermal receipt.
 * Optional future slots: taxNumber, companyRegNumber.
 */
export default function ReceiptHeader({ settings }) {
  const logoUrl = resolveMediaUrl(settings?.logo)
  const storeName = settings?.storeName || 'محل البدل'
  const phone = settings?.phone
  const address = settings?.address
  const taxNumber = settings?.taxNumber
  const companyRegNumber = settings?.companyRegNumber

  return (
    <header className="receipt-center">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={storeName}
          className="receipt-logo"
        />
      ) : null}
      <h1 className="receipt-store-name">{storeName}</h1>
      {phone ? <p className="receipt-muted">{phone}</p> : null}
      {address ? <p className="receipt-muted">{address}</p> : null}
      <div className="receipt-future-slot">
        {taxNumber ? (
          <p className="receipt-muted">الرقم الضريبي: {taxNumber}</p>
        ) : null}
        {companyRegNumber ? (
          <p className="receipt-muted">السجل التجاري: {companyRegNumber}</p>
        ) : null}
      </div>
    </header>
  )
}
