import React, { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowRight,
  FiEye,
  FiFileText,
  FiShoppingBag,
  FiTrendingUp,
  FiRotateCcw,
  FiDollarSign,
} from 'react-icons/fi'
import { useDailyProfits } from '../../hooks/useProfits'
import { useInvoices } from '../../hooks/useInvoices'
import { useFormatMoney } from '../../hooks/useSettings'
import { INVOICE_STATUS } from '../../constants/invoices'
import ScrollableTable, { stickyTheadClass } from '../../components/ScrollableTable'

const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
]

const isValidDateKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '')

const dayNameFromKey = (dateKey) => {
  if (!isValidDateKey(dateKey)) return ''
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return ARABIC_DAYS[date.getDay()] || ''
}

const formatDateTime = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function dayQueryRange(dateKey) {
  return {
    from: `${dateKey}T00:00:00.000`,
    to: `${dateKey}T23:59:59.999`,
    limit: 100,
  }
}

function StatCard({ label, value, hint, icon: Icon, tone = 'navy' }) {
  const tones = {
    navy: 'text-[#1e2a38]',
    gold: 'text-[#9e7e3a]',
    green: 'text-emerald-700',
    red: 'text-red-600',
  }
  return (
    <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-[#8a939e]">{label}</p>
          <p className={`mt-1 text-xl font-bold ${tones[tone]}`}>{value}</p>
          {hint ? (
            <p className="mt-1 text-[11px] text-[#8a939e]">{hint}</p>
          ) : null}
        </div>
        <div className="flex size-9 items-center justify-center rounded-xl bg-[#1e2a38]/5 text-[#1e2a38]">
          <Icon size={16} />
        </div>
      </div>
    </div>
  )
}

export default function ProfitDayDetails() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { formatMoney } = useFormatMoney()
  const valid = isValidDateKey(date)

  const profitsParams = useMemo(
    () => (valid ? { from: date, to: date } : {}),
    [date, valid]
  )

  const invoiceParams = useMemo(
    () => (valid ? dayQueryRange(date) : { limit: 1 }),
    [date, valid]
  )

  const {
    data: profits,
    isLoading: profitsLoading,
    isError: profitsError,
    error: profitsErr,
    refetch: refetchProfits,
  } = useDailyProfits(profitsParams)

  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    isError: invoicesError,
    error: invoicesErr,
    refetch: refetchInvoices,
  } = useInvoices(invoiceParams, { enabled: valid })

  const day =
    profits?.days?.find((d) => d.date === date) ||
    (valid
      ? {
          date,
          dayName: dayNameFromKey(date),
          sales: { invoiceCount: 0, total: 0 },
          returns: { invoiceCount: 0, total: 0 },
          cost: 0,
          netRevenue: 0,
          profit: 0,
        }
      : null)

  const invoices = invoicesData?.items ?? []
  const listTotal = invoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  )

  if (!valid) {
    return (
      <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-bold text-[#1e2a38]">تاريخ غير صالح</p>
        <p className="mt-2 text-sm text-[#5c6570]">
          صيغة التاريخ يجب أن تكون YYYY-MM-DD
        </p>
        <Link
          to="/profits"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#9e7e3a] hover:underline"
        >
          <FiArrowRight size={16} />
          العودة للأرباح
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5" dir="rtl" lang="ar">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/profits')}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#5c6570] transition hover:text-[#1e2a38]"
          >
            <FiArrowRight size={16} />
            العودة للأرباح اليومية
          </button>
          <h1 className="text-2xl font-bold text-[#1e2a38]">
            تفاصيل يوم {day?.dayName || dayNameFromKey(date)}
          </h1>
          <p className="mt-1 text-sm text-[#5c6570]">
            {date} · كل الفواتير والمبيعات لهذا اليوم
          </p>
        </div>
      </div>

      {profitsLoading ? (
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-[#5c6570]">جاري تحميل ملخص اليوم...</p>
        </div>
      ) : profitsError ? (
        <div className="space-y-3 rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-600" role="alert">
            {profitsErr?.message || 'تعذر تحميل ملخص اليوم'}
          </p>
          <button
            type="button"
            onClick={() => refetchProfits()}
            className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="مبيعات اليوم"
            value={formatMoney(day.sales?.total)}
            hint={`${day.sales?.invoiceCount ?? 0} فاتورة`}
            icon={FiShoppingBag}
            tone="gold"
          />
          <StatCard
            label="المرتجعات"
            value={formatMoney(day.returns?.total)}
            hint={`${day.returns?.invoiceCount ?? 0} مرتجع`}
            icon={FiRotateCcw}
            tone="red"
          />
          <StatCard
            label="تكلفة البضاعة"
            value={formatMoney(day.cost)}
            icon={FiDollarSign}
          />
          <StatCard
            label="صافي الربح"
            value={formatMoney(day.profit)}
            hint={`صافي الإيراد: ${formatMoney(day.netRevenue)}`}
            icon={FiTrendingUp}
            tone={(day.profit ?? 0) >= 0 ? 'green' : 'red'}
          />
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
            <FiFileText size={16} />
            فواتير ومبيعات اليوم
          </h2>
          <span className="text-xs text-[#8a939e]">
            {invoices.length} فاتورة
            {invoices.length > 0
              ? ` · المجموع ${formatMoney(listTotal)}`
              : ''}
          </span>
        </div>

        {invoicesLoading ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            جاري تحميل الفواتير...
          </div>
        ) : invoicesError ? (
          <div className="space-y-3 px-4 py-12 text-center">
            <p className="text-sm text-red-600" role="alert">
              {invoicesErr?.message || 'تعذر تحميل الفواتير'}
            </p>
            <button
              type="button"
              onClick={() => refetchInvoices()}
              className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            لا توجد فواتير في هذا اليوم
          </div>
        ) : (
          <ScrollableTable>
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className={stickyTheadClass}>
                <tr>
                  <th className="px-4 py-3 font-semibold">رقم الفاتورة</th>
                  <th className="px-4 py-3 font-semibold">العميل</th>
                  <th className="px-4 py-3 font-semibold">الدفع</th>
                  <th className="px-4 py-3 font-semibold">الإجمالي</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold">الوقت</th>
                  <th className="px-4 py-3 font-semibold">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a38]/6">
                {invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="transition hover:bg-[#f7f5f2]/70"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1e2a38]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-[#3d4654]">
                      {inv.customerName || 'عميل نقدي'}
                    </td>
                    <td className="px-4 py-3 text-[#5c6570]">
                      {inv.paymentMethod || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1e2a38]">
                      {formatMoney(inv.total)}
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
                      {formatDateTime(inv.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/invoices/${inv._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg p-2 text-[#5c6570] transition hover:bg-[#1e2a38]/5 hover:text-[#1e2a38]"
                        aria-label="عرض الفاتورة"
                        title="عرض الفاتورة"
                      >
                        <FiEye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        )}
      </section>
    </div>
  )
}
