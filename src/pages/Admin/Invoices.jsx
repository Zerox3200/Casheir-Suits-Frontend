import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiPlus,
  FiFileText,
  FiEye,
  FiRotateCcw,
  FiFilter,
  FiSearch,
} from 'react-icons/fi'
import { INVOICE_STATUS, PAYMENT_METHODS } from '../../constants/invoices'
import { useInvoices } from '../../hooks/useInvoices'
import { useProducts } from '../../hooks/useProducts'
import AddInvoiceDrawer from '../../components/invoices/AddInvoiceDrawer'
import ReturnInvoiceDrawer from '../../components/invoices/ReturnInvoiceDrawer'
import ScrollableTable, { stickyTheadClass } from '../../components/ScrollableTable'
import { useFormatMoney } from '../../hooks/useSettings'

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function Invoices() {
  const { formatMoney } = useFormatMoney()
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [numberSearch, setNumberSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [returnInvoice, setReturnInvoice] = useState(null)

  const listParams = useMemo(() => {
    const params = { limit: 100 }
    if (statusFilter !== 'all') params.status = statusFilter
    if (paymentFilter !== 'all') params.paymentMethod = paymentFilter
    return params
  }, [statusFilter, paymentFilter])

  const {
    data: invoicesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useInvoices(listParams)

  const { data: allInvoicesData } = useInvoices({ limit: 100 })
  const { data: productsData } = useProducts({ limit: 100 })

  const invoices = invoicesData?.items ?? []
  const allInvoices = allInvoicesData?.items ?? []
  const products = productsData?.items ?? []

  const filtered = useMemo(() => {
    const q = numberSearch.trim().toLowerCase()
    if (!q) return invoices
    return invoices.filter((inv) =>
      inv.invoiceNumber?.toLowerCase().includes(q)
    )
  }, [invoices, numberSearch])

  const counts = useMemo(() => {
    const completed = allInvoices.filter(
      (i) => i.status === INVOICE_STATUS.COMPLETED
    ).length
    const returned = allInvoices.filter(
      (i) => i.status === INVOICE_STATUS.RETURNED
    ).length
    const cash = allInvoices.filter(
      (i) => i.paymentMethod === PAYMENT_METHODS.CASH
    ).length
    const visa = allInvoices.filter(
      (i) => i.paymentMethod === PAYMENT_METHODS.VISA
    ).length
    return {
      completed,
      returned,
      cash,
      visa,
      all: allInvoicesData?.pagination?.total ?? allInvoices.length,
    }
  }, [allInvoices, allInvoicesData])

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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#1e2a38]/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
                <FiFileText size={16} />
                الفواتير
              </h2>
              <span className="text-xs text-[#8a939e]">
                {filtered.length} فاتورة
              </span>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <FiSearch
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a939e]"
                size={16}
              />
              <input
                type="search"
                value={numberSearch}
                onChange={(e) => setNumberSearch(e.target.value)}
                placeholder="بحث برقم الفاتورة..."
                className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] py-2 pr-9 pl-3 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a]/50 focus:ring-1 focus:ring-[#9e7e3a]/20"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
              جاري تحميل الفواتير...
            </div>
          ) : isError ? (
            <div className="space-y-3 px-4 py-12 text-center">
              <p className="text-sm text-red-600" role="alert">
                {error?.message || 'تعذر تحميل الفواتير'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
              {numberSearch.trim()
                ? 'لا توجد فواتير مطابقة للبحث'
                : 'لا توجد فواتير'}
            </div>
          ) : (
            <ScrollableTable>
              <table className="w-full min-w-[820px] text-right text-sm">
                <thead className={stickyTheadClass}>
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
                    <tr
                      key={inv._id}
                      className="transition hover:bg-[#f7f5f2]/70"
                    >
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
                        {inv.items?.length ?? 0} منتج
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1e2a38]">
                        {formatMoney(inv.total)}
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
            </ScrollableTable>
          )}
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
        products={products}
      />
      <ReturnInvoiceDrawer
        open={Boolean(returnInvoice)}
        onClose={() => setReturnInvoice(null)}
        invoice={returnInvoice}
      />
    </div>
  )
}
