import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FiCalendar,
  FiTrendingUp,
  FiShoppingBag,
  FiRotateCcw,
  FiDollarSign,
  FiFilter,
  FiSearch,
  FiEye,
} from 'react-icons/fi'
import { useDailyProfits } from '../../hooks/useProfits'
import { useFormatMoney } from '../../hooks/useSettings'
import ScrollableTable, { stickyTheadClass } from '../../components/ScrollableTable'
import { appToast } from '../../helpers/toast'

const toDateInput = (date) => {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1)

const startOfYear = (date = new Date()) =>
  new Date(date.getFullYear(), 0, 1)

const PRESETS = [
  { key: 'today', label: 'اليوم' },
  { key: '7', label: '٧ أيام' },
  { key: '30', label: '٣٠ يوم' },
  { key: 'month', label: 'هذا الشهر' },
  { key: 'year', label: 'هذه السنة' },
]

function getPresetRange(key) {
  const today = new Date()
  const to = toDateInput(today)

  if (key === 'today') {
    return { from: to, to }
  }
  if (key === '7') {
    const from = new Date(today)
    from.setDate(from.getDate() - 6)
    return { from: toDateInput(from), to }
  }
  if (key === '30') {
    const from = new Date(today)
    from.setDate(from.getDate() - 29)
    return { from: toDateInput(from), to }
  }
  if (key === 'month') {
    return { from: toDateInput(startOfMonth(today)), to }
  }
  if (key === 'year') {
    return { from: toDateInput(startOfYear(today)), to }
  }

  const from = new Date(today)
  from.setDate(from.getDate() - 29)
  return { from: toDateInput(from), to }
}

function ProfitTooltip({ active, payload, formatMoney }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div
      className="rounded-lg border border-[#1e2a38]/10 bg-white px-3 py-2 text-xs shadow-md"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
    >
      <p className="font-semibold text-[#1e2a38]">{row.label || row.date}</p>
      <p className="mt-1 text-[#5c6570]">
        المبيعات: {formatMoney(row.sales)}
      </p>
      <p className="text-emerald-700">الربح: {formatMoney(row.profit)}</p>
    </div>
  )
}

function MiniCard({ label, value, hint, icon: Icon, tone = 'navy' }) {
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

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'

export default function Profits() {
  const navigate = useNavigate()
  const { formatMoney } = useFormatMoney()
  const defaultRange = getPresetRange('30')

  const [draftFrom, setDraftFrom] = useState(defaultRange.from)
  const [draftTo, setDraftTo] = useState(defaultRange.to)
  const [appliedRange, setAppliedRange] = useState(defaultRange)
  const [activePreset, setActivePreset] = useState('30')

  const {
    data: profits,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDailyProfits(appliedRange)

  const summary = profits?.summary
  const days = profits?.days ?? []

  const chartData = useMemo(() => {
    return [...days]
      .slice()
      .reverse()
      .map((day) => ({
        date: day.date,
        label: day.dayName || day.label,
        shortLabel: day.date?.slice(5) || day.date,
        sales: day.sales?.total ?? 0,
        profit: day.profit ?? 0,
      }))
  }, [days])

  const marginPct =
    summary?.salesTotal > 0
      ? Math.round((summary.profitTotal / summary.salesTotal) * 1000) / 10
      : 0

  const applyFilter = (from = draftFrom, to = draftTo, presetKey = null) => {
    if (!from || !to) {
      appToast.error('يرجى اختيار تاريخ البداية والنهاية')
      return
    }
    if (from > to) {
      appToast.error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية')
      return
    }
    setAppliedRange({ from, to })
    setActivePreset(presetKey)

    if (from === to) {
      appToast.success(`تم جلب أرباح يوم ${from}`)
    } else {
      appToast.success(`تم جلب الأرباح من ${from} إلى ${to}`)
    }
  }

  const applyPreset = (key) => {
    const next = getPresetRange(key)
    setDraftFrom(next.from)
    setDraftTo(next.to)
    applyFilter(next.from, next.to, key)
  }

  return (
    <div className="space-y-5" dir="rtl" lang="ar">
      <div>
        <h1 className="text-2xl font-bold text-[#1e2a38]">الأرباح اليومية</h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          المبيعات − المرتجعات − التكلفة = صافي الربح
        </p>
      </div>

      <section className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
            <FiFilter size={16} />
            تصفية حسب التاريخ
          </h2>
          <p className="text-xs text-[#8a939e]">
            <FiCalendar className="ml-1 inline" size={12} />
            الفترة الحالية: {appliedRange.from} ← {appliedRange.to}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activePreset === p.key
                  ? 'bg-[#1e2a38] text-white'
                  : 'bg-[#f7f5f2] text-[#5c6570] hover:bg-[#ebe6df]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilter(draftFrom, draftTo, null)
          }}
        >
          <div>
            <label htmlFor="profits-from" className="mb-1.5 block text-sm text-[#3d4654]">
              من تاريخ
            </label>
            <input
              id="profits-from"
              type="date"
              value={draftFrom}
              max={draftTo || undefined}
              onChange={(e) => {
                setDraftFrom(e.target.value)
                setActivePreset(null)
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profits-to" className="mb-1.5 block text-sm text-[#3d4654]">
              إلى تاريخ
            </label>
            <input
              id="profits-to"
              type="date"
              value={draftTo}
              min={draftFrom || undefined}
              onChange={(e) => {
                setDraftTo(e.target.value)
                setActivePreset(null)
              }}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e2a38] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
          >
            <FiSearch size={16} />
            عرض النتائج
          </button>
        </form>
      </section>

      {isLoading ? (
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-[#5c6570]">جاري تحميل الأرباح...</p>
        </div>
      ) : isError ? (
        <div className="space-y-3 rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-600" role="alert">
            {error?.message || 'تعذر تحميل الأرباح'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniCard
              label="إجمالي المبيعات"
              value={formatMoney(summary?.salesTotal)}
              hint={`${summary?.salesCount ?? 0} فاتورة`}
              icon={FiShoppingBag}
              tone="gold"
            />
            <MiniCard
              label="المرتجعات"
              value={formatMoney(summary?.returnsTotal)}
              hint={`${summary?.returnsCount ?? 0} مرتجع`}
              icon={FiRotateCcw}
              tone="red"
            />
            <MiniCard
              label="تكلفة البضاعة"
              value={formatMoney(summary?.costTotal)}
              hint={`خصومات: ${formatMoney(summary?.discountTotal)}`}
              icon={FiDollarSign}
            />
            <MiniCard
              label="صافي الربح"
              value={formatMoney(summary?.profitTotal)}
              hint={
                summary?.salesTotal > 0
                  ? `هامش ربح تقريبي ${marginPct}%`
                  : 'لا مبيعات في الفترة'
              }
              icon={FiTrendingUp}
              tone="green"
            />
          </div>

          <div className="rounded-2xl border border-[#9e7e3a]/25 bg-[#9e7e3a]/5 px-4 py-3 text-sm text-[#5c6570]">
            <p>
              <span className="font-semibold text-[#1e2a38]">كيف يُحسب؟</span>{' '}
              صافي الإيراد ({formatMoney(summary?.netRevenue)}) = المبيعات −
              المرتجعات، ثم الربح = صافي الإيراد − التكلفة.
              {isFetching ? (
                <span className="mr-2 text-[11px] text-[#8a939e]">
                  · جاري التحديث...
                </span>
              ) : null}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
            <h3 className="mb-1 text-sm font-bold text-[#1e2a38]">
              مسار المبيعات والربح
            </h3>
            <p className="mb-4 text-xs text-[#8a939e]">
              مقارنة يومية خلال الفترة المحددة
            </p>
            {chartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#8a939e]">
                لا توجد بيانات لهذه الفترة
              </p>
            ) : (
              <div dir="ltr" style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9e7e3a" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#9e7e3a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient
                        id="profitFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#047857" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#047857" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3814" />
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fill: '#5c6570', fontSize: 11 }}
                      axisLine={{ stroke: '#1e2a3820' }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#8a939e', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={64}
                      tickFormatter={(v) => formatMoney(v)}
                    />
                    <Tooltip
                      content={<ProfitTooltip formatMoney={formatMoney} />}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="المبيعات"
                      stroke="#9e7e3a"
                      fill="url(#salesFill)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="الربح"
                      stroke="#047857"
                      fill="url(#profitFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <ul className="mt-3 flex flex-wrap justify-center gap-4 text-[11px] text-[#5c6570]">
              <li className="inline-flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-[#9e7e3a]" />
                المبيعات
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-emerald-700" />
                الربح
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
              <h3 className="text-sm font-bold text-[#1e2a38]">
                تفاصيل كل يوم
              </h3>
              <span className="text-xs text-[#8a939e]">{days.length} يوم</span>
            </div>

            {days.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-[#8a939e]">
                لا توجد أيام ضمن هذه الفترة
              </p>
            ) : (
              <ScrollableTable>
                <table className="w-full min-w-[720px] text-right text-sm">
                  <thead className={stickyTheadClass}>
                    <tr>
                      <th className="px-4 py-3 font-semibold">اليوم</th>
                      <th className="px-4 py-3 font-semibold">فواتير</th>
                      <th className="px-4 py-3 font-semibold">المبيعات</th>
                      <th className="px-4 py-3 font-semibold">مرتجع</th>
                      <th className="px-4 py-3 font-semibold">التكلفة</th>
                      <th className="px-4 py-3 font-semibold">الربح</th>
                      <th className="px-4 py-3 font-semibold">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2a38]/6">
                    {days.map((day) => {
                      const profit = day.profit ?? 0
                      return (
                        <tr
                          key={day.date}
                          className="cursor-pointer transition hover:bg-[#f7f5f2]/70"
                          onClick={() => navigate(`/profits/${day.date}`)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#1e2a38]">
                              {day.dayName}
                            </p>
                            <p className="text-[11px] text-[#8a939e]">
                              {day.date}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-[#3d4654]">
                            {day.sales?.invoiceCount ?? 0}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#1e2a38]">
                            {formatMoney(day.sales?.total)}
                          </td>
                          <td className="px-4 py-3 text-red-600">
                            {formatMoney(day.returns?.total)}
                          </td>
                          <td className="px-4 py-3 text-[#5c6570]">
                            {formatMoney(day.cost)}
                          </td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              profit >= 0 ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {formatMoney(profit)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/profits/${day.date}`)
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e2a38] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2a3a4d]"
                            >
                              <FiEye size={12} />
                              التفاصيل
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </ScrollableTable>
            )}
          </div>
        </>
      )}
    </div>
  )
}
