import React, { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FiArrowRight, FiPrinter } from 'react-icons/fi'
import ReceiptLayout from '../../components/Receipt/ReceiptLayout'
import { DEFAULT_SETTINGS, useSettings } from '../../hooks/useSettings'
import { useInvoice } from '../../hooks/useInvoices'
import '../../components/Receipt/receipt.css'

/**
 * Dedicated print view: /invoices/:id/receipt
 * Query: ?autoPrint=1&returnTo=/orders|/invoices/:id
 */
export default function InvoiceReceipt() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const autoPrint = searchParams.get('autoPrint') === '1'
  const returnTo = searchParams.get('returnTo') || `/invoices/${id}`

  const printedRef = useRef(false)

  const {
    data: invoice,
    isLoading: invoiceLoading,
    isError: invoiceError,
    error: invoiceErr,
    refetch,
  } = useInvoice(id)

  const {
    data: settings,
    isLoading: settingsLoading,
    isFetched: settingsFetched,
  } = useSettings({ retry: 1 })

  const mergedSettings = settings || DEFAULT_SETTINGS
  const settingsReady = settingsFetched || !settingsLoading
  const ready = Boolean(invoice) && !invoiceLoading && settingsReady

  useEffect(() => {
    if (!autoPrint || !ready || printedRef.current) return

    printedRef.current = true

    const handleAfterPrint = () => {
      navigate(returnTo, { replace: true })
    }

    window.addEventListener('afterprint', handleAfterPrint)

    const timer = window.setTimeout(() => {
      window.print()
    }, 350)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [autoPrint, ready, navigate, returnTo])

  if (invoiceLoading && !invoice) {
    return (
      <div className="receipt-print-root" dir="rtl">
        <p>جاري تجهيز الإيصال...</p>
      </div>
    )
  }

  if (invoiceError || !invoice) {
    return (
      <div className="receipt-print-root" dir="rtl">
        <p role="alert">
          {invoiceErr?.message || 'تعذر تحميل الفاتورة للطباعة'}
        </p>
        <div className="receipt-print-actions">
          <button type="button" onClick={() => refetch()}>
            إعادة المحاولة
          </button>
          <Link to="/invoices">العودة للفواتير</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="receipt-print-root" dir="rtl" lang="ar">
      <div className="receipt-print-actions no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <FiPrinter size={16} />
          طباعة الإيصال
        </button>
        <button
          type="button"
          onClick={() => navigate(returnTo)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a38]/20 bg-white px-3.5 py-2 text-sm font-semibold text-[#1e2a38]"
        >
          <FiArrowRight size={16} />
          رجوع
        </button>
      </div>

      <ReceiptLayout invoice={invoice} settings={mergedSettings} />
    </div>
  )
}
