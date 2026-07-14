import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowRight, FiFileText, FiRotateCcw } from 'react-icons/fi'
import {
  getMockInvoiceById,
  INVOICE_STATUS,
  PAYMENT_METHODS,
} from './invoicesMock'
import ReturnInvoiceDrawer from '../../components/invoices/ReturnInvoiceDrawer'

const formatMoney = (value) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value ?? 0)

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function DetailItem({ label, children }) {
  return (
    <div className="rounded-xl border border-[#1e2a38]/8 bg-[#f7f5f2]/60 p-4">
      <p className="mb-1 text-xs font-medium text-[#8a939e]">{label}</p>
      <div className="text-sm font-semibold text-[#1e2a38]">{children}</div>
    </div>
  )
}

export default function InvoiceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const invoice = getMockInvoiceById(id)
  const [returnOpen, setReturnOpen] = useState(false)

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-bold text-[#1e2a38]">الفاتورة غير موجودة</p>
        <p className="mt-2 text-sm text-[#5c6570]">
          لم يتم العثور على فاتورة بهذا المعرّف
        </p>
        <Link
          to="/invoices"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#9e7e3a] hover:underline"
        >
          <FiArrowRight size={16} />
          العودة للفواتير
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#5c6570] transition hover:text-[#1e2a38]"
          >
            <FiArrowRight size={16} />
            العودة للفواتير
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-[#1e2a38]">
              {invoice.invoiceNumber}
            </h1>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                invoice.status === INVOICE_STATUS.COMPLETED
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {invoice.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#5c6570]">
            تفاصيل الفاتورة · {formatDate(invoice.createdAt)}
          </p>
        </div>

        {invoice.status === INVOICE_STATUS.COMPLETED && (
          <button
            type="button"
            onClick={() => setReturnOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <FiRotateCcw size={16} />
            إرجاع الفاتورة
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailItem label="اسم العميل">
          {invoice.customerName || 'عميل نقدي'}
        </DetailItem>
        <DetailItem label="هاتف العميل">
          {invoice.customerPhone || '—'}
        </DetailItem>
        <DetailItem label="طريقة الدفع">
          <span
            className={
              invoice.paymentMethod === PAYMENT_METHODS.VISA
                ? 'text-sky-700'
                : 'text-amber-800'
            }
          >
            {invoice.paymentMethod}
          </span>
        </DetailItem>
        <DetailItem label="أنشأها">
          {invoice.createdBy?.name || '—'}
          {invoice.createdBy?.role && (
            <span className="mt-0.5 block text-xs font-normal text-[#8a939e]">
              {invoice.createdBy.role}
            </span>
          )}
        </DetailItem>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#1e2a38]/8 px-4 py-3">
          <FiFileText size={16} className="text-[#1e2a38]" />
          <h2 className="text-sm font-bold text-[#1e2a38]">عناصر الفاتورة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
              <tr>
                <th className="px-4 py-3 font-semibold">المنتج</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">الكمية</th>
                <th className="px-4 py-3 font-semibold">سعر الوحدة</th>
                <th className="px-4 py-3 font-semibold">تكلفة الوحدة</th>
                <th className="px-4 py-3 font-semibold">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a38]/6">
              {invoice.items.map((item, idx) => (
                <tr key={`${item.productId}-${idx}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1e2a38]">{item.name}</p>
                    {item.barcode && (
                      <p className="text-xs text-[#8a939e]">{item.barcode}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#3d4654]">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-[#3d4654]">{item.quantity}</td>
                  <td className="px-4 py-3 text-[#3d4654]">
                    {formatMoney(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-[#8a939e]">
                    {formatMoney(item.unitCost)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#1e2a38]">
                    {formatMoney(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-2xl border border-[#1e2a38]/8 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-[#1e2a38]">ملاحظات</h2>
          <p className="text-sm leading-relaxed text-[#5c6570]">
            {invoice.notes || 'لا توجد ملاحظات'}
          </p>

          {invoice.status === INVOICE_STATUS.RETURNED && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold text-red-600">بيانات الإرجاع</p>
              <p className="mt-2 text-sm text-[#1e2a38]">
                {invoice.returnReason || '—'}
              </p>
              <p className="mt-2 text-xs text-[#5c6570]">
                بواسطة {invoice.returnedBy?.name || '—'} ·{' '}
                {formatDate(invoice.returnedAt)}
              </p>
            </div>
          )}
        </section>

        <aside className="rounded-2xl bg-[#1e2a38] p-5 text-white shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-white/80">الملخص المالي</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>المجموع الفرعي</span>
              <span>{formatMoney(invoice.subTotal)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>الخصم</span>
              <span>- {formatMoney(invoice.discount)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>الضريبة</span>
              <span>+ {formatMoney(invoice.tax)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-lg font-bold">
              <span>الإجمالي</span>
              <span>{formatMoney(invoice.total)} ج.م</span>
            </div>
          </div>
        </aside>
      </div>

      <ReturnInvoiceDrawer
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        invoice={invoice}
      />
    </div>
  )
}
