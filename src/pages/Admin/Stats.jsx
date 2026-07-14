import React from 'react'
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
import { mockDashboard, mockActivityLogs } from './dashboardMock'
import { INVOICE_STATUS } from './invoicesMock'

const formatMoney = (value) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value ?? 0)

const formatDate = (value) =>
  new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

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

export default function Stats() {
  const d = mockDashboard

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1e2a38]">
          إحصائيات السيستم والجرد
        </h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          لوحة التحكم · النشاط · المخزون · المبيعات
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="مبيعات اليوم"
          value={`${formatMoney(d.todaySales.amount)} ج.م`}
          hint={`${d.todaySales.invoiceCount} فاتورة`}
          icon={FiTrendingUp}
          accent="text-[#9e7e3a]"
        />
        <StatCard
          label="مبيعات الشهر"
          value={`${formatMoney(d.monthlySales.amount)} ج.م`}
          hint={`${d.monthlySales.invoiceCount} فاتورة`}
          icon={FiBarChart2}
        />
        <StatCard
          label="إجمالي الإيراد"
          value={`${formatMoney(d.totalRevenue)} ج.م`}
          icon={FiFileText}
        />
        <StatCard
          label="صافي الربح"
          value={`${formatMoney(d.totalProfit)} ج.م`}
          icon={FiTrendingUp}
          accent="text-emerald-700"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="منتجات نشطة"
          value={d.totalProducts}
          icon={FiBox}
        />
        <StatCard
          label="إجمالي الفواتير"
          value={d.totalInvoices}
          icon={FiFileText}
        />
        <StatCard
          label="تنبيهات المخزن"
          value={d.lowStock.count + d.outOfStock.count}
          hint={`${d.lowStock.count} منخفض · ${d.outOfStock.count} نفد`}
          icon={FiAlertTriangle}
          accent="text-amber-700"
        />
      </div>

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
          <ul className="space-y-2">
            {[...d.outOfStock.products, ...d.lowStock.products].map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between rounded-xl border border-[#1e2a38]/8 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-[#1e2a38]">
                    {s.productId?.name}
                  </p>
                  <p className="font-mono text-[11px] text-[#8a939e]">
                    {s.productId?.sku}
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
            {d.outOfStock.count + d.lowStock.count === 0 && (
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
          <ul className="space-y-2">
            {d.recentInvoices.map((inv) => (
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
          </ul>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="border-b border-[#1e2a38]/8 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
            <FiActivity size={16} />
            سجل النشاط (Activity Log)
          </h2>
          <p className="mt-1 text-xs text-[#8a939e]">
            كل عمليات النظام: منتجات · فواتير · مخزون · مستخدمين
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
              <tr>
                <th className="px-4 py-3 font-semibold">الإجراء</th>
                <th className="px-4 py-3 font-semibold">الكيان</th>
                <th className="px-4 py-3 font-semibold">الوصف</th>
                <th className="px-4 py-3 font-semibold">المستخدم</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a38]/6">
              {mockActivityLogs.map((log) => (
                <tr key={log._id} className="hover:bg-[#f7f5f2]/70">
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#1e2a38]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#1e2a38]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#3d4654]">{log.entity}</td>
                  <td className="max-w-[280px] px-4 py-3 text-[#5c6570]">
                    {log.description}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1e2a38]">
                      {log.user?.name}
                    </p>
                    <p className="text-[11px] text-[#8a939e]">
                      {log.user?.role}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5c6570]">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/products', label: 'إدارة المنتجات' },
          { to: '/orders', label: 'نقطة البيع / الأوردرات' },
          { to: '/invoices', label: 'إدارة الفواتير' },
          { to: '/stock', label: 'المخزن' },
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
