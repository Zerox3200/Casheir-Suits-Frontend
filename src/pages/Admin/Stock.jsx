import React, { useMemo, useState } from 'react'
import {
  FiPackage,
  FiAlertTriangle,
  FiEdit2,
  FiActivity,
} from 'react-icons/fi'
import {
  mockStock,
  mockStockMovements,
  mockLowStock,
  mockOutOfStock,
  STOCK_MOVEMENT_TYPE,
} from './stockMock'
import AdjustStockDrawer from '../../components/stock/AdjustStockDrawer'

const formatDate = (value) =>
  new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export default function Stock() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [adjustItem, setAdjustItem] = useState(null)

  const filteredMovements = useMemo(() => {
    if (typeFilter === 'all') return mockStockMovements
    return mockStockMovements.filter((m) => m.type === typeFilter)
  }, [typeFilter])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1e2a38]">المخزن</h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          إدارة الكميات · حركات المخزون · تنبيهات النقص
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8a939e]">إجمالي الأصناف</p>
          <p className="mt-1 text-2xl font-bold text-[#1e2a38]">
            {mockStock.length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="flex items-center gap-1 text-xs text-amber-800">
            <FiAlertTriangle size={12} />
            مخزون منخفض
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-800">
            {mockLowStock.length}
          </p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-xs text-red-600">نفد من المخزن</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {mockOutOfStock.length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
            <FiPackage size={16} />
            أرصدة المخزن
          </h2>
          <span className="text-xs text-[#8a939e]">{mockStock.length} صنف</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
              <tr>
                <th className="px-4 py-3 font-semibold">المنتج</th>
                <th className="px-4 py-3 font-semibold">التصنيف</th>
                <th className="px-4 py-3 font-semibold">الكمية</th>
                <th className="px-4 py-3 font-semibold">الحد الأدنى</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">آخر تحديث</th>
                <th className="px-4 py-3 font-semibold">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a38]/6">
              {mockStock.map((item) => {
                const p = item.productId
                const low = item.quantity > 0 && item.quantity <= item.minimumQuantity
                const out = item.quantity === 0
                return (
                  <tr key={item._id} className="hover:bg-[#f7f5f2]/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1e2a38]">{p.name}</p>
                      <p className="font-mono text-[11px] text-[#8a939e]">
                        {p.sku}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#3d4654]">
                      {p.categoryId?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-lg font-bold text-[#1e2a38]">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-[#5c6570]">
                      {item.minimumQuantity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          out
                            ? 'bg-red-50 text-red-600'
                            : low
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {out ? 'نفد' : low ? 'منخفض' : 'متوفر'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5c6570]">
                      {formatDate(item.lastUpdated)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setAdjustItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e2a38] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2a3a4d]"
                      >
                        <FiEdit2 size={12} />
                        تحديث الكمية
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#1e2a38]/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
            <FiActivity size={16} />
            حركات المخزون
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل' },
              { key: STOCK_MOVEMENT_TYPE.IN, label: 'دخول' },
              { key: STOCK_MOVEMENT_TYPE.OUT, label: 'خروج' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setTypeFilter(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  typeFilter === f.key
                    ? 'bg-[#1e2a38] text-white'
                    : 'bg-[#f7f5f2] text-[#5c6570] hover:bg-[#ebe6df]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
              <tr>
                <th className="px-4 py-3 font-semibold">المنتج</th>
                <th className="px-4 py-3 font-semibold">الكمية</th>
                <th className="px-4 py-3 font-semibold">النوع</th>
                <th className="px-4 py-3 font-semibold">السبب</th>
                <th className="px-4 py-3 font-semibold">المرجع</th>
                <th className="px-4 py-3 font-semibold">بواسطة</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a38]/6">
              {filteredMovements.map((m) => (
                <tr key={m._id} className="hover:bg-[#f7f5f2]/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1e2a38]">
                      {m.productId?.name}
                    </p>
                    <p className="font-mono text-[11px] text-[#8a939e]">
                      {m.productId?.sku}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#1e2a38]">
                    {m.quantity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        m.type === STOCK_MOVEMENT_TYPE.IN
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#3d4654]">{m.reason}</td>
                  <td className="px-4 py-3 text-xs text-[#5c6570]">
                    {m.referenceType}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5c6570]">
                    {m.createdBy?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5c6570]">
                    {formatDate(m.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdjustStockDrawer
        open={Boolean(adjustItem)}
        onClose={() => setAdjustItem(null)}
        stockItem={adjustItem}
      />
    </div>
  )
}
