import React from 'react'
import { Link } from 'react-router-dom'
import { FiActivity, FiArrowRight } from 'react-icons/fi'
import { useActivityLogs } from '../../hooks/useActivityLogs'
import ActivityLogCharts from '../../components/stats/ActivityLogCharts'
import ScrollableTable, { stickyTheadClass } from '../../components/ScrollableTable'

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function ActivityLog() {
  const {
    data: logsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useActivityLogs({ limit: 100 })

  const logs = logsData?.items ?? []

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/stats"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#5c6570] transition hover:text-[#1e2a38]"
        >
          <FiArrowRight size={16} />
          العودة للإحصائيات
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1e2a38]">
          <FiActivity size={24} />
          سجل النشاط
        </h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          كل عمليات النظام: منتجات · فواتير · مخزون · مستخدمين
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-[#5c6570]">جاري تحميل سجل النشاط...</p>
        </div>
      ) : isError ? (
        <div className="space-y-3 rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-600" role="alert">
            {error?.message || 'تعذر تحميل سجل النشاط'}
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
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
              <p className="text-xs text-[#8a939e]">إجمالي السجلات</p>
              <p className="mt-1 text-2xl font-bold text-[#1e2a38]">
                {logs.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
              <p className="text-xs text-[#8a939e]">أنواع الكيانات</p>
              <p className="mt-1 text-2xl font-bold text-[#9e7e3a]">
                {new Set(logs.map((l) => l.entity).filter(Boolean)).size}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
              <p className="text-xs text-[#8a939e]">أنواع الإجراءات</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {new Set(logs.map((l) => l.action).filter(Boolean)).size}
              </p>
            </div>
          </div>

          <ActivityLogCharts logs={logs} />

          <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
              <h2 className="text-sm font-bold text-[#1e2a38]">
                تفاصيل السجل
              </h2>
              <span className="text-xs text-[#8a939e]">{logs.length} سجل</span>
            </div>

            {logs.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
                لا يوجد نشاط مسجّل بعد
              </div>
            ) : (
              <ScrollableTable className="max-h-[min(70vh,640px)]">
                <table className="w-full min-w-[720px] text-right text-sm">
                  <thead className={stickyTheadClass}>
                    <tr>
                      <th className="px-4 py-3 font-semibold">الإجراء</th>
                      <th className="px-4 py-3 font-semibold">الكيان</th>
                      <th className="px-4 py-3 font-semibold">الوصف</th>
                      <th className="px-4 py-3 font-semibold">المستخدم</th>
                      <th className="px-4 py-3 font-semibold">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2a38]/6">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-[#f7f5f2]/70">
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#1e2a38]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#1e2a38]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#3d4654]">
                          {log.entity || '—'}
                        </td>
                        <td className="max-w-[320px] px-4 py-3 text-[#5c6570]">
                          {log.description || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[#1e2a38]">
                            {log.user?.name || '—'}
                          </p>
                          <p className="text-[11px] text-[#8a939e]">
                            {log.user?.role || ''}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#5c6570]">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollableTable>
            )}
          </section>
        </>
      )}
    </div>
  )
}
