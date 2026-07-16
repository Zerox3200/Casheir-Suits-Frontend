import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBarChart2,
  FiTrendingUp,
  FiBox,
  FiFileText,
  FiAlertTriangle,
  FiClock,
  FiActivity,
} from 'react-icons/fi'
import { INVOICE_STATUS } from '../../constants/invoices'
import { useDashboard } from '../../hooks/useDashboard'
import { useFormatMoney } from '../../hooks/useSettings'
import StatsBriefCharts from '../../components/stats/StatsBriefCharts'

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function StatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-[#8a939e]">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${accent || 'text-[#1e2a38]'}`}>
            {value}
          </p>
          {hint && <p className="mt-1 text-[11px] text-[#8a939e]">{hint}</p>}
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#1e2a38]/5 text-[#1e2a38]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

const emptyDashboard = {
  todaySales: { amount: 0, invoiceCount: 0 },
  monthlySales: { amount: 0, invoiceCount: 0 },
  totalRevenue: 0,
  totalProfit: 0,
  totalProducts: 0,
  totalInvoices: 0,
  recentInvoices: [],
  outOfStock: { count: 0, products: [] },
  lowStock: { count: 0, products: [] },
}

export default function Stats() {
  const { formatMoney } = useFormatMoney()
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
    error: dashboardErr,
    refetch: refetchDashboard,
  } = useDashboard()

  const d = dashboard ?? emptyDashboard

  const alertProducts = useMemo(() => {
    const out = d.outOfStock?.products ?? []
    const low = (d.lowStock?.products ?? []).filter((s) => s.quantity > 0)
    return [...out, ...low]
  }, [d])

  const outCount = d.outOfStock?.count ?? (d.outOfStock?.products ?? []).length
  const lowCount = (d.lowStock?.products ?? []).filter((s) => s.quantity > 0)
    .length

  if (dashboardLoading) {
    return (
      <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#5c6570]">جاري تحميل الإحصائيات...</p>
      </div>
    )
  }

  if (dashboardError) {
    return (
      <div className="space-y-3 rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-red-600" role="alert">
          {dashboardErr?.message || 'تعذر تحميل الإحصائيات'}
        </p>
        <button
          type="button"
          onClick={() => refetchDashboard()}
          className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e2a38]">
            إحصائيات السيستم والجرد
          </h1>
          <p className="mt-1 text-sm text-[#5c6570]">
            لوحة التحكم · المخزون · المبيعات
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/profits"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1e2a38] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
          >
            <FiTrendingUp size={16} />
            الأرباح اليومية
          </Link>
          <Link
            to="/activity-log"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a38]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1e2a38] transition hover:bg-[#f7f5f2]"
          >
            <FiActivity size={16} />
            سجل النشاط
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="مبيعات اليوم"
          value={formatMoney(d.todaySales?.amount)}
          hint={`${d.todaySales?.invoiceCount ?? 0} فاتورة`}
          icon={FiTrendingUp}
          accent="text-[#9e7e3a]"
        />
        <StatCard
          label="مبيعات الشهر"
          value={formatMoney(d.monthlySales?.amount)}
          hint={`${d.monthlySales?.invoiceCount ?? 0} فاتورة`}
          icon={FiBarChart2}
        />
        <StatCard
          label="إجمالي الإيراد"
          value={formatMoney(d.totalRevenue)}
          icon={FiFileText}
        />
        <StatCard
          label="صافي الربح"
          value={formatMoney(d.totalProfit)}
          icon={FiTrendingUp}
          accent="text-emerald-700"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="منتجات نشطة"
          value={d.totalProducts ?? 0}
          icon={FiBox}
        />
        <StatCard
          label="إجمالي الفواتير"
          value={d.totalInvoices ?? 0}
          icon={FiFileText}
        />
        <StatCard
          label="تنبيهات المخزن"
          value={lowCount + outCount}
          hint={`${lowCount} منخفض · ${outCount} نفد`}
          icon={FiAlertTriangle}
          accent="text-amber-700"
        />
      </div>

      <StatsBriefCharts
        todaySales={d.todaySales?.amount}
        monthlySales={d.monthlySales?.amount}
        totalRevenue={d.totalRevenue}
        totalProfit={d.totalProfit}
        lowCount={lowCount}
        outCount={outCount}
        totalProducts={d.totalProducts}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiAlertTriangle size={16} className="text-amber-600" />
              مخزون منخفض / نفد
            </h2>
            <Link
              to="/stock"
              className="text-xs font-semibold text-[#9e7e3a] hover:underline"
            >
              فتح المخزن
            </Link>
          </div>
          <ul className="max-h-[min(40vh,360px)] space-y-2 overflow-y-auto">
            {alertProducts.map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between rounded-xl border border-[#1e2a38]/8 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-[#1e2a38]">
                    {s.productId?.name || '—'}
                  </p>
                  <p className="font-mono text-[11px] text-[#8a939e]">
                    {s.productId?.sku || '—'}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#1e2a38]">
                    {s.quantity}
                  </p>
                  <p
                    className={`text-[11px] font-semibold ${
                      s.quantity === 0 ? 'text-red-600' : 'text-amber-700'
                    }`}
                  >
                    {s.quantity === 0 ? 'نفد' : 'منخفض'}
                  </p>
                </div>
              </li>
            ))}
            {alertProducts.length === 0 && (
              <p className="py-6 text-center text-sm text-[#8a939e]">
                لا توجد تنبيهات حالياً
              </p>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiClock size={16} />
              آخر الفواتير
            </h2>
            <Link
              to="/invoices"
              className="text-xs font-semibold text-[#9e7e3a] hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <ul className="max-h-[min(40vh,360px)] space-y-2 overflow-y-auto">
            {(d.recentInvoices ?? []).map((inv) => (
              <li key={inv._id}>
                <Link
                  to={`/invoices/${inv._id}`}
                  className="flex items-center justify-between rounded-xl border border-[#1e2a38]/8 px-3 py-2.5 transition hover:bg-[#f7f5f2]"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#1e2a38]">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-[11px] text-[#8a939e]">
                      {inv.customerName || 'عميل نقدي'} ·{' '}
                      {formatDate(inv.createdAt)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#1e2a38]">
                      {formatMoney(inv.total)}
                    </p>
                    <span
                      className={`text-[11px] font-semibold ${
                        inv.status === INVOICE_STATUS.COMPLETED
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
            {(d.recentInvoices ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-[#8a939e]">
                لا توجد فواتير بعد
              </p>
            )}
          </ul>
        </section>
      </div>

      <Link
        to="/activity-log"
        className="flex items-center justify-between rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm transition hover:border-[#9e7e3a]/40 hover:bg-[#f7f5f2]"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#1e2a38]/5 text-[#1e2a38]">
            <FiActivity size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1e2a38]">سجل النشاط</p>
            <p className="text-xs text-[#8a939e]">
              عرض كل عمليات النظام بالتفصيل
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#9e7e3a]">فتح ←</span>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { to: '/products', label: 'إدارة المنتجات' },
          { to: '/orders', label: 'نقطة البيع / الأوردرات' },
          { to: '/invoices', label: 'إدارة الفواتير' },
          { to: '/stock', label: 'المخزن' },
          { to: '/profits', label: 'الأرباح اليومية' },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-xl border border-[#1e2a38]/10 bg-white px-4 py-3 text-center text-sm font-semibold text-[#1e2a38] shadow-sm transition hover:border-[#9e7e3a]/40 hover:bg-[#f7f5f2]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
