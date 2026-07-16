import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiPackage,
  FiAlertTriangle,
  FiAlertCircle,
  FiEdit2,
  FiActivity,
  FiX,
  FiChevronLeft,
  FiSearch,
} from 'react-icons/fi'
import { STOCK_MOVEMENT_TYPE } from '../../constants/stock'
import { useStock, useStockMovements } from '../../hooks/useStock'
import { useScanProduct } from '../../hooks/useProducts'
import AdjustStockDrawer from '../../components/stock/AdjustStockDrawer'
import BarcodeScanner from '../../components/barcode/BarcodeScanner'
import { playScanError, playScanSuccess } from '../../helpers/scanSounds'
import { appToast } from '../../helpers/toast'
import ScrollableTable, { stickyTheadClass } from '../../components/ScrollableTable'

const STOCK_FILTER = {
  ALL: 'all',
  OK: 'ok',
  LOW: 'low',
  OUT: 'out',
}

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const productIdOf = (item) =>
  item?.productId?._id || item?.productId || null

const getStockLevel = (item) => {
  const qty = Number(item?.quantity) || 0
  const min = Number(item?.minimumQuantity) || 0
  if (qty <= 0) return 'out'
  if (qty <= min) return 'low'
  return 'ok'
}

const levelLabel = {
  out: 'نفد',
  low: 'منخفض',
  ok: 'متوفر',
}

const levelBadgeClass = {
  out: 'bg-red-50 text-red-700 ring-1 ring-red-200/80',
  low: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80',
  ok: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70',
}

export default function Stock() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState(STOCK_FILTER.ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [movementsSearch, setMovementsSearch] = useState('')
  const [alertsDismissed, setAlertsDismissed] = useState(false)
  const [adjustItem, setAdjustItem] = useState(null)
  const scanProduct = useScanProduct()

  const {
    data: stockData,
    isLoading: stockLoading,
    isError: stockError,
    error: stockErr,
    refetch: refetchStock,
  } = useStock({ limit: 100 })

  const movementParams = useMemo(
    () => ({
      limit: 100,
      ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    }),
    [typeFilter]
  )

  const {
    data: movementsData,
    isLoading: movementsLoading,
    isError: movementsError,
    error: movementsErr,
    refetch: refetchMovements,
  } = useStockMovements(movementParams)

  const stockItems = stockData?.items ?? []
  const movements = movementsData?.items ?? []

  const alertItems = useMemo(() => {
    return stockItems
      .map((item) => ({ item, level: getStockLevel(item) }))
      .filter(({ level }) => level === 'out' || level === 'low')
      .sort((a, b) => {
        if (a.level !== b.level) return a.level === 'out' ? -1 : 1
        return (a.item.quantity ?? 0) - (b.item.quantity ?? 0)
      })
  }, [stockItems])

  const lowStockCount = useMemo(
    () => alertItems.filter(({ level }) => level === 'low').length,
    [alertItems]
  )

  const outOfStockCount = useMemo(
    () => alertItems.filter(({ level }) => level === 'out').length,
    [alertItems]
  )

  const alertTotal = alertItems.length
  const hasCritical = outOfStockCount > 0
  const showAlertsBanner = alertTotal > 0 && !alertsDismissed

  const filteredStock = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return stockItems.filter((item) => {
      if (stockFilter !== STOCK_FILTER.ALL && getStockLevel(item) !== stockFilter) {
        return false
      }
      if (!q) return true
      const p = item.productId
      const name = String(p?.name || '').toLowerCase()
      const sku = String(p?.sku || '').toLowerCase()
      const barcode = String(p?.barcode || '').toLowerCase()
      return name.includes(q) || sku.includes(q) || barcode.includes(q)
    })
  }, [stockItems, stockFilter, searchQuery])

  const filteredMovements = useMemo(() => {
    const q = movementsSearch.trim().toLowerCase()
    if (!q) return movements
    return movements.filter((m) => {
      const p = m.productId
      const name = String(p?.name || '').toLowerCase()
      const sku = String(p?.sku || '').toLowerCase()
      return name.includes(q) || sku.includes(q)
    })
  }, [movements, movementsSearch])

  const handleBarcodeScan = async (code) => {
    try {
      const { product, stock } = await scanProduct.mutateAsync({ code })
      if (!product?._id) {
        playScanError()
        appToast.error('المنتج غير موجود')
        return
      }

      const fromList = stockItems.find(
        (s) => String(productIdOf(s)) === String(product._id)
      )
      const item =
        fromList ||
        (stock
          ? {
            ...stock,
            productId:
              typeof stock.productId === 'object' && stock.productId?.name
                ? stock.productId
                : product,
          }
          : {
            productId: product,
            quantity: 0,
            minimumQuantity: product.minimumQuantity ?? 0,
          })

      playScanSuccess()
      setAdjustItem(item)
      appToast.success(`تعديل مخزون: ${product.name}`)
    } catch {
      playScanError()
      appToast.error('المنتج غير موجود')
    }
  }

  const focusAlerts = (filter = STOCK_FILTER.LOW) => {
    setAlertsDismissed(false)
    setStockFilter(filter)
    document
      .getElementById('stock-alerts-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-5" dir="rtl" lang="ar">
      <div>
        <h1 className="text-2xl font-bold text-[#1e2a38]">المخزن</h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          إدارة الكميات · حركات المخزون · تنبيهات النقص
        </p>
      </div>

      <AnimatePresence initial={false}>
        {showAlertsBanner && (
          <motion.div
            key="stock-alert-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            role="alert"
            aria-live="polite"
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5 ${hasCritical
                ? 'border-red-200/90 bg-gradient-to-l from-red-50 via-white to-amber-50/40'
                : 'border-amber-200/90 bg-gradient-to-l from-amber-50 via-white to-[#9e7e3a]/8'
              }`}
          >
            <div
              className={`pointer-events-none absolute -left-6 -top-6 size-28 rounded-full opacity-40 blur-2xl ${hasCritical ? 'bg-red-200' : 'bg-amber-200'
                }`}
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div
                  className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${hasCritical
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-900'
                    }`}
                >
                  {hasCritical ? (
                    <FiAlertCircle size={20} />
                  ) : (
                    <FiAlertTriangle size={20} />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${hasCritical ? 'text-red-800' : 'text-amber-950'
                      }`}
                  >
                    {hasCritical
                      ? 'تنبيه عاجل: أصناف نفدت أو قاربت على النفاد'
                      : 'تنبيه مخزون: أصناف منخفضة الكمية'}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#5c6570]">
                    {hasCritical ? (
                      <>
                        يوجد{' '}
                        <span className="font-semibold text-red-700">
                          {outOfStockCount} صنف نافد
                        </span>
                        {lowStockCount > 0 && (
                          <>
                            {' '}
                            و{' '}
                            <span className="font-semibold text-amber-800">
                              {lowStockCount} منخفض
                            </span>
                          </>
                        )}
                        . يُفضّل تحديث الكميات فورًا لتجنب توقف البيع.
                      </>
                    ) : (
                      <>
                        يوجد{' '}
                        <span className="font-semibold text-amber-900">
                          {lowStockCount} صنف
                        </span>{' '}
                        تحت الحد الأدنى. راجع التنبيهات وحدّث الكمية قبل نفاد
                        المخزون.
                      </>
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {outOfStockCount > 0 && (
                      stockFilter === STOCK_FILTER.OUT ? (
                        <button
                          type="button"
                          onClick={() => setStockFilter(STOCK_FILTER.ALL)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          <FiX size={14} />
                          إلغاء عرض النافد
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => focusAlerts(STOCK_FILTER.OUT)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-800"
                        >
                          عرض النافد
                          <FiChevronLeft size={14} />
                        </button>
                      )
                    )}
                    {lowStockCount > 0 && (
                      stockFilter === STOCK_FILTER.LOW ? (
                        <button
                          type="button"
                          onClick={() => setStockFilter(STOCK_FILTER.ALL)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2a38]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#1e2a38] transition hover:bg-[#f7f5f2]"
                        >
                          <FiX size={14} />
                          إلغاء عرض المنخفض
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => focusAlerts(STOCK_FILTER.LOW)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e2a38] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2a3a4d]"
                        >
                          عرض المنخفض
                          <FiChevronLeft size={14} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertsDismissed(true)}
                className="absolute left-3 top-3 rounded-lg p-1.5 text-[#8a939e] transition hover:bg-black/5 hover:text-[#1e2a38] sm:static sm:shrink-0"
                aria-label="إخفاء التنبيه"
                title="إخفاء"
              >
                <FiX size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            key: STOCK_FILTER.ALL,
            label: 'إجمالي الأصناف',
            value: stockItems.length,
            tone: 'default',
          },
          {
            key: STOCK_FILTER.LOW,
            label: 'مخزون منخفض',
            value: lowStockCount,
            tone: 'amber',
            icon: true,
          },
          {
            key: STOCK_FILTER.OUT,
            label: 'نفد من المخزن',
            value: outOfStockCount,
            tone: 'red',
          },
          {
            key: STOCK_FILTER.OK,
            label: 'متوفر بشكل جيد',
            value: stockItems.length - alertTotal,
            tone: 'green',
          },
        ].map((card) => {
          const active = stockFilter === card.key
          const tones = {
            default: active
              ? 'border-[#1e2a38] bg-[#1e2a38] text-white shadow-md'
              : 'border-[#1e2a38]/8 bg-white hover:border-[#1e2a38]/20',
            amber: active
              ? 'border-amber-700 bg-amber-700 text-white shadow-md'
              : 'border-amber-200 bg-amber-50 hover:border-amber-300',
            red: active
              ? 'border-red-700 bg-red-700 text-white shadow-md'
              : 'border-red-200 bg-red-50 hover:border-red-300',
            green: active
              ? 'border-emerald-700 bg-emerald-700 text-white shadow-md'
              : 'border-emerald-200 bg-emerald-50/80 hover:border-emerald-300',
          }
          const labelTone = {
            default: active ? 'text-white/75' : 'text-[#8a939e]',
            amber: active ? 'text-white/80' : 'text-amber-800',
            red: active ? 'text-white/80' : 'text-red-600',
            green: active ? 'text-white/80' : 'text-emerald-700',
          }
          const valueTone = {
            default: active ? 'text-white' : 'text-[#1e2a38]',
            amber: active ? 'text-white' : 'text-amber-900',
            red: active ? 'text-white' : 'text-red-700',
            green: active ? 'text-white' : 'text-emerald-800',
          }
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setStockFilter(card.key)}
              className={`rounded-2xl border p-4 text-right shadow-sm transition ${tones[card.tone]}`}
            >
              <p
                className={`flex items-center gap-1 text-xs font-medium ${labelTone[card.tone]}`}
              >
                {card.icon && <FiAlertTriangle size={12} />}
                {card.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${valueTone[card.tone]}`}>
                {card.value}
              </p>
              <p
                className={`mt-1 text-[11px] ${active ? 'text-white/65' : 'text-[#8a939e]'
                  }`}
              >
                {active ? 'الفلتر نشط' : 'انقر للتصفية'}
              </p>
            </button>
          )
        })}
      </div>

      {alertTotal > 0 && (
        <section
          id="stock-alerts-panel"
          className={`overflow-hidden rounded-2xl border shadow-sm ${hasCritical
              ? 'border-red-200/80 bg-white'
              : 'border-amber-200/80 bg-white'
            }`}
        >
          <div
            className={`flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${hasCritical
                ? 'border-red-100 bg-red-50/50'
                : 'border-amber-100 bg-amber-50/50'
              }`}
          >
            <div>
              <h2
                className={`flex items-center gap-2 text-sm font-bold ${hasCritical ? 'text-red-800' : 'text-amber-950'
                  }`}
              >
                <FiAlertTriangle size={16} />
                تنبيهات النقص
              </h2>
              <p className="mt-0.5 text-xs text-[#5c6570]">
                الأصناف التي تحتاج إعادة تموين · اضغط «تحديث» لتعديل الكمية
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${hasCritical
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-900'
                }`}
            >
              {alertTotal} تنبيه
            </span>
          </div>

          <ul className="divide-y divide-[#1e2a38]/6">
            {alertItems.map(({ item, level }, index) => {
              const p = item.productId
              const deficit = Math.max(
                0,
                (item.minimumQuantity ?? 0) - (item.quantity ?? 0)
              )
              return (
                <motion.li
                  key={item._id || productIdOf(item)}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.24) }}
                  className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${level === 'out' ? 'bg-red-50/40' : 'bg-amber-50/30'
                    }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-[#1e2a38]">
                        {p?.name || '—'}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${levelBadgeClass[level]}`}
                      >
                        {levelLabel[level]}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-[#8a939e]">
                      {p?.sku || '—'}
                      {p?.categoryId?.name ? ` · ${p.categoryId.name}` : ''}
                    </p>
                    <p className="mt-1.5 text-xs text-[#5c6570]">
                      الكمية الحالية{' '}
                      <span
                        className={`font-bold ${level === 'out' ? 'text-red-700' : 'text-amber-900'
                          }`}
                      >
                        {item.quantity}
                      </span>
                      {' · '}
                      الحد الأدنى{' '}
                      <span className="font-semibold text-[#1e2a38]">
                        {item.minimumQuantity}
                      </span>
                      {level === 'low' && deficit > 0 && (
                        <>
                          {' · '}
                          ينقص{' '}
                          <span className="font-semibold text-[#9e7e3a]">
                            {deficit}
                          </span>{' '}
                          للوصول للحد
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdjustItem(item)}
                    disabled={!productIdOf(item)}
                    className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition disabled:opacity-50 ${level === 'out'
                        ? 'bg-red-700 hover:bg-red-800'
                        : 'bg-[#1e2a38] hover:bg-[#2a3a4d]'
                      }`}
                  >
                    <FiEdit2 size={13} />
                    تحديث الكمية
                  </button>
                </motion.li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#1e2a38]/8 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
                <FiPackage size={16} />
                أرصدة المخزن
              </h2>
              <span className="text-xs text-[#8a939e]">
                {filteredStock.length} صنف
              </span>
              {stockFilter !== STOCK_FILTER.ALL && (
                <button
                  type="button"
                  onClick={() => setStockFilter(STOCK_FILTER.ALL)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2a38]/15 bg-[#f7f5f2] px-2.5 py-1 text-xs font-semibold text-[#1e2a38] transition hover:bg-[#ebe6df]"
                >
                  <FiX size={13} />
                  {stockFilter === STOCK_FILTER.LOW
                    ? 'إلغاء عرض المنخفض'
                    : stockFilter === STOCK_FILTER.OUT
                      ? 'إلغاء عرض النافد'
                      : 'إلغاء الفلتر'}
                </button>
              )}
            </div>
            <div className="w-full sm:max-w-md">
              <BarcodeScanner
                onScan={handleBarcodeScan}
                disabled={scanProduct.isLoading}
                placeholder="امسح الباركود لفتح تعديل الكمية..."
                allowSimulate={false}
              />
            </div>
          </div>

          <div className="relative w-full sm:max-w-md sm:ms-auto">
            <FiSearch
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a939e]"
              size={16}
            />
            <input
              id="stock-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو SKU..."
              className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] py-2.5 pr-10 pl-9 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25"
              autoComplete="off"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#8a939e] hover:text-[#1e2a38]"
                aria-label="مسح البحث"
              >
                <FiX size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {stockLoading ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            جاري تحميل المخزون...
          </div>
        ) : stockError ? (
          <div className="space-y-3 px-4 py-12 text-center">
            <p className="text-sm text-red-600" role="alert">
              {stockErr?.message || 'تعذر تحميل المخزون'}
            </p>
            <button
              type="button"
              onClick={() => refetchStock()}
              className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            {stockItems.length === 0
              ? 'لا توجد أرصدة مخزن'
              : searchQuery.trim()
                ? 'لا توجد نتائج مطابقة للبحث'
                : 'لا توجد أصناف مطابقة لهذا الفلتر'}
          </div>
        ) : (
          <ScrollableTable>
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className={stickyTheadClass}>
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
                {filteredStock.map((item) => {
                  const p = item.productId
                  const level = getStockLevel(item)
                  return (
                    <tr
                      key={item._id}
                      className={`transition hover:bg-[#f7f5f2]/70 ${level === 'out'
                          ? 'bg-red-50/50'
                          : level === 'low'
                            ? 'bg-amber-50/40'
                            : ''
                        }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          {(level === 'out' || level === 'low') && (
                            <span
                              className={`mt-1.5 size-2 shrink-0 rounded-full ${level === 'out' ? 'bg-red-500' : 'bg-amber-500'
                                }`}
                              title={levelLabel[level]}
                            />
                          )}
                          <div>
                            <p className="font-medium text-[#1e2a38]">
                              {p?.name || '—'}
                            </p>
                            <p className="font-mono text-[11px] text-[#8a939e]">
                              {p?.sku || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#3d4654]">
                        {p?.categoryId?.name || '—'}
                      </td>
                      <td
                        className={`px-4 py-3 text-lg font-bold ${level === 'out'
                            ? 'text-red-700'
                            : level === 'low'
                              ? 'text-amber-900'
                              : 'text-[#1e2a38]'
                          }`}
                      >
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-[#5c6570]">
                        {item.minimumQuantity}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${levelBadgeClass[level]}`}
                        >
                          {levelLabel[level]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#5c6570]">
                        {formatDate(item.lastUpdated)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setAdjustItem(item)}
                          disabled={!productIdOf(item)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 ${level === 'out'
                              ? 'bg-red-700 hover:bg-red-800'
                              : level === 'low'
                                ? 'bg-amber-800 hover:bg-amber-900'
                                : 'bg-[#1e2a38] hover:bg-[#2a3a4d]'
                            }`}
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
          </ScrollableTable>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#1e2a38]/8 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
                <FiActivity size={16} />
                حركات المخزون
              </h2>
              <span className="text-xs text-[#8a939e]">
                {filteredMovements.length} حركة
              </span>
            </div>
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

          <div className="relative w-full sm:max-w-md sm:ms-auto">
            <FiSearch
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a939e]"
              size={16}
            />
            <input
              id="movements-search"
              type="search"
              value={movementsSearch}
              onChange={(e) => setMovementsSearch(e.target.value)}
              placeholder="بحث في الحركات بالاسم أو SKU..."
              className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] py-2.5 pr-10 pl-9 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25"
              autoComplete="off"
            />
            {movementsSearch ? (
              <button
                type="button"
                onClick={() => setMovementsSearch('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#8a939e] hover:text-[#1e2a38]"
                aria-label="مسح البحث"
              >
                <FiX size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {movementsLoading ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            جاري تحميل الحركات...
          </div>
        ) : movementsError ? (
          <div className="space-y-3 px-4 py-12 text-center">
            <p className="text-sm text-red-600" role="alert">
              {movementsErr?.message || 'تعذر تحميل حركات المخزون'}
            </p>
            <button
              type="button"
              onClick={() => refetchMovements()}
              className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            {movements.length === 0
              ? 'لا توجد حركات مخزون'
              : movementsSearch.trim()
                ? 'لا توجد حركات مطابقة للبحث'
                : 'لا توجد حركات لهذا الفلتر'}
          </div>
        ) : (
          <ScrollableTable>
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className={stickyTheadClass}>
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
                        {m.productId?.name || '—'}
                      </p>
                      <p className="font-mono text-[11px] text-[#8a939e]">
                        {m.productId?.sku || '—'}
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
                      {m.referenceType || '—'}
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
          </ScrollableTable>
        )}
      </section>

      <AdjustStockDrawer
        open={Boolean(adjustItem)}
        onClose={() => setAdjustItem(null)}
        stockItem={adjustItem}
      />
    </div>
  )
}
