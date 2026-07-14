import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiPlus,
  FiFileText,
  FiEye,
  FiRotateCcw,
  FiFilter,
} from 'react-icons/fi'
import {
  mockInvoices,
  INVOICE_STATUS,
  PAYMENT_METHODS,
} from './invoicesMock'
import { mockProducts } from './productsMock'
import AddInvoiceDrawer from '../../components/invoices/AddInvoiceDrawer'
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

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [returnInvoice, setReturnInvoice] = useState(null)

  const filtered = useMemo(() => {
    return mockInvoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      if (paymentFilter !== 'all' && inv.paymentMethod !== paymentFilter)
        return false
      return true
    })
  }, [statusFilter, paymentFilter])

  const counts = useMemo(() => {
    const completed = mockInvoices.filter(
      (i) => i.status === INVOICE_STATUS.COMPLETED
    ).length
    const returned = mockInvoices.filter(
      (i) => i.status === INVOICE_STATUS.RETURNED
    ).length
    const cash = mockInvoices.filter(
      (i) => i.paymentMethod === PAYMENT_METHODS.CASH
    ).length
    const visa = mockInvoices.filter(
      (i) => i.paymentMethod === PAYMENT_METHODS.VISA
    ).length
    return { completed, returned, cash, visa, all: mockInvoices.length }
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e2a38]">إدارة الفواتير</h1>
          <p className="mt-1 text-sm text-[#5c6570]">
            إنشاء فواتير البيع · الإرجاع · متابعة المدفوعات
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e2a38] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
        >
          <FiPlus size={16} />
          إضافة فاتورة
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8a939e]">إجمالي الفواتير</p>
          <p className="mt-1 text-2xl font-bold text-[#1e2a38]">{counts.all}</p>
        </div>
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8a939e]">مكتملة</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {counts.completed}
          </p>
        </div>
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8a939e]">مرتجعة</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{counts.returned}</p>
        </div>
      </div>

      {/* RTL: first col = right (table), second = left (filters) */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiFileText size={16} />
              الفواتير
            </h2>
            <span className="text-xs text-[#8a939e]">{filtered.length} فاتورة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-right text-sm">
              <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
                <tr>
                  <th className="px-4 py-3 font-semibold">رقم الفاتورة</th>
                  <th className="px-4 py-3 font-semibold">العميل</th>
                  <th className="px-4 py-3 font-semibold">العناصر</th>
                  <th className="px-4 py-3 font-semibold">الإجمالي</th>
                  <th className="px-4 py-3 font-semibold">الدفع</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                  <th className="px-4 py-3 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a38]/6">
                {filtered.map((inv) => (
                  <tr key={inv._id} className="transition hover:bg-[#f7f5f2]/70">
                    <td className="px-4 py-3">
                      <Link
                        to={`/invoices/${inv._id}`}
                        className="font-mono text-xs font-semibold text-[#1e2a38] hover:text-[#9e7e3a]"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1e2a38]">
                        {inv.customerName || 'عميل نقدي'}
                      </p>
                      {inv.customerPhone && (
                        <p className="text-xs text-[#8a939e]">
                          {inv.customerPhone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#3d4654]">
                      {inv.items.length} منتج
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1e2a38]">
                      {formatMoney(inv.total)} ج.م
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          inv.paymentMethod === PAYMENT_METHODS.VISA
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          inv.status === INVOICE_STATUS.COMPLETED
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5c6570]">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/invoices/${inv._id}`}
                          className="rounded-lg p-2 text-[#5c6570] transition hover:bg-[#1e2a38]/5 hover:text-[#1e2a38]"
                          aria-label="عرض التفاصيل"
                          title="عرض التفاصيل"
                        >
                          <FiEye size={16} />
                        </Link>
                        {inv.status === INVOICE_STATUS.COMPLETED && (
                          <button
                            type="button"
                            onClick={() => setReturnInvoice(inv)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                            aria-label="إرجاع الفاتورة"
                            title="إرجاع الفاتورة"
                          >
                            <FiRotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiFilter size={14} />
              الحالة
            </h2>
            <ul className="space-y-1.5">
              {[
                { key: 'all', label: 'الكل', count: counts.all },
                {
                  key: INVOICE_STATUS.COMPLETED,
                  label: INVOICE_STATUS.COMPLETED,
                  count: counts.completed,
                },
                {
                  key: INVOICE_STATUS.RETURNED,
                  label: INVOICE_STATUS.RETURNED,
                  count: counts.returned,
                },
              ].map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter(item.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                      statusFilter === item.key
                        ? 'bg-[#1e2a38] font-semibold text-white'
                        : 'text-[#3d4654] hover:bg-[#f7f5f2]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={
                        statusFilter === item.key
                          ? 'text-white/70'
                          : 'text-[#8a939e]'
                      }
                    >
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#1e2a38]">طريقة الدفع</h2>
            <ul className="space-y-1.5">
              {[
                { key: 'all', label: 'الكل', count: counts.all },
                {
                  key: PAYMENT_METHODS.CASH,
                  label: PAYMENT_METHODS.CASH,
                  count: counts.cash,
                },
                {
                  key: PAYMENT_METHODS.VISA,
                  label: PAYMENT_METHODS.VISA,
                  count: counts.visa,
                },
              ].map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter(item.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                      paymentFilter === item.key
                        ? 'bg-[#1e2a38] font-semibold text-white'
                        : 'text-[#3d4654] hover:bg-[#f7f5f2]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={
                        paymentFilter === item.key
                          ? 'text-white/70'
                          : 'text-[#8a939e]'
                      }
                    >
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <AddInvoiceDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        products={mockProducts}
      />
      <ReturnInvoiceDrawer
        open={Boolean(returnInvoice)}
        onClose={() => setReturnInvoice(null)}
        invoice={returnInvoice}
      />
    </div>
  )
}
