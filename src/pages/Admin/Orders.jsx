import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiBox,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiShoppingBag,
  FiFileText,
  FiEye,
  FiSearch,
  FiPrinter,
} from 'react-icons/fi'
import { PAYMENT_METHODS, INVOICE_STATUS } from '../../constants/invoices'
import { useProducts, useScanProduct } from '../../hooks/useProducts'
import { useStock } from '../../hooks/useStock'
import BarcodeScanner from '../../components/barcode/BarcodeScanner'
import {
  useCreateInvoice,
  useInvoiceByNumber,
  useInvoices,
  INVOICES_QUERY_KEY,
} from '../../hooks/useInvoices'
import { useFormatMoney, useSettings } from '../../hooks/useSettings'
import { playScanError, playScanSuccess } from '../../helpers/scanSounds'
import { appToast } from '../../helpers/toast'
import ScrollableTable, { stickyTheadClass } from '../../components/ScrollableTable'
import { useQueryClient } from 'react-query'

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function Orders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { formatMoney } = useFormatMoney()
  const { data: settings } = useSettings()
  const [cart, setCart] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH)
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState('')
  const [taxTouched, setTaxTouched] = useState(false)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (taxTouched) return
    const defaultTax = Number(settings?.defaultTax)
    if (!Number.isNaN(defaultTax) && defaultTax >= 0) {
      setTax(defaultTax)
    }
  }, [settings?.defaultTax, taxTouched])

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErr,
    refetch: refetchProducts,
  } = useProducts({ limit: 100 })

  const { data: stockData } = useStock({ limit: 100 })

  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    isError: invoicesError,
    error: invoicesErr,
    refetch: refetchInvoices,
  } = useInvoices({ limit: 50 })

  const createInvoice = useCreateInvoice()
  const scanProduct = useScanProduct()

  const stockByProduct = useMemo(() => {
    const map = new Map()
    ;(stockData?.items ?? []).forEach((s) => {
      const id = s.productId?._id || s.productId
      if (id) map.set(String(id), s.quantity)
    })
    return map
  }, [stockData])

  const activeProducts = useMemo(() => {
    const list = (productsData?.items ?? []).filter((p) => p.isActive !== false)
    const q = productSearch.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
    )
  }, [productsData, productSearch])

  const invoiceNumberQuery = invoiceSearch.trim()
  const recentInvoices = invoicesData?.items ?? []

  const localInvoiceMatches = useMemo(() => {
    if (!invoiceNumberQuery) return recentInvoices
    const q = invoiceNumberQuery.toLowerCase()
    return recentInvoices.filter((inv) =>
      inv.invoiceNumber?.toLowerCase().includes(q)
    )
  }, [recentInvoices, invoiceNumberQuery])

  const {
    data: invoiceByNumber,
    isFetching: lookingUpNumber,
  } = useInvoiceByNumber(invoiceNumberQuery, {
    enabled: Boolean(invoiceNumberQuery) && localInvoiceMatches.length === 0,
  })

  const displayedInvoices = useMemo(() => {
    if (!invoiceNumberQuery) return recentInvoices
    if (localInvoiceMatches.length) return localInvoiceMatches
    if (invoiceByNumber) return [invoiceByNumber]
    return []
  }, [
    invoiceNumberQuery,
    recentInvoices,
    localInvoiceMatches,
    invoiceByNumber,
  ])

  const addToCart = (product, stockQtyOverride) => {
    const stockQty =
      stockQtyOverride ??
      stockByProduct.get(String(product._id)) ??
      0
    const existing = cart.find((i) => i.productId === product._id)

    if (existing) {
      if (existing.quantity >= stockQty) {
        return { added: false, reason: 'insufficient' }
      }
      setCart((prev) =>
        prev.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      )
      return { added: true, reason: null }
    }

    if (stockQty < 1) {
      return { added: false, reason: 'out' }
    }

    setCart((prev) => [
      ...prev,
      {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.sellingPrice,
        unitCost: product.costPrice,
        quantity: 1,
      },
    ])
    return { added: true, reason: null }
  }

  const handleBarcodeScan = async (code) => {
    try {
      const { product, stock } = await scanProduct.mutateAsync({
        code,
        requireActive: true,
      })

      if (!product?._id) {
        playScanError()
        appToast.error('Product not found')
        return
      }

      const stockQty =
        stock?.quantity ??
        stockByProduct.get(String(product._id)) ??
        0

      const { added, reason } = addToCart(product, stockQty)

      if (added) {
        playScanSuccess()
        setProductSearch(product.barcode || product.sku || product.name || '')
        appToast.success(`تمت إضافة: ${product.name}`)
        return
      }

      playScanError()
      if (reason === 'out') {
        appToast.error('المنتج غير متوفر في المخزون')
        return
      }
      if (reason === 'insufficient') {
        appToast.error('لا يمكن تجاوز الكمية المتوفرة في المخزون')
      }
    } catch {
      playScanError()
      appToast.error('Product not found')
    }
  }

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i
          const stockQty = stockByProduct.get(String(productId)) ?? 0
          const next = Math.min(stockQty, Math.max(0, i.quantity + delta))
          return { ...i, quantity: next }
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  const resetCheckout = () => {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setDiscount(0)
    setTax(Number(settings?.defaultTax) || 0)
    setTaxTouched(false)
    setNotes('')
    setPaymentMethod(PAYMENT_METHODS.CASH)
  }

  const subTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const total = Math.max(0, subTotal - Number(discount || 0) + Number(tax || 0))

  const submitInvoice = async ({ print = false } = {}) => {
    if (!cart.length || submitting) return

    setSubmitting(true)
    try {
      const result = await createInvoice.mutateAsync({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        paymentMethod,
        notes: notes.trim(),
      })
      const invoice = result.data?.invoice
      const invoiceId = invoice?._id
      const number = invoice?.invoiceNumber

      if (invoiceId && invoice) {
        queryClient.setQueryData([...INVOICES_QUERY_KEY, invoiceId], invoice)
      }

      appToast.success(
        number
          ? `تم إصدار الفاتورة ${number}`
          : result.message || 'تم إصدار الفاتورة بنجاح'
      )
      resetCheckout()
      setInvoiceSearch('')

      if (!invoiceId) return

      if (print) {
        navigate(
          `/invoices/${invoiceId}/receipt?autoPrint=1&returnTo=${encodeURIComponent('/orders')}`
        )
      } else {
        navigate(`/invoices/${invoiceId}`)
      }
    } catch (error) {
      appToast.error(error?.message || 'تعذر إصدار الفاتورة')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1e2a38]">إدارة الأوردرات</h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          نقطة البيع · اختر منتجات وأنشئ فاتورة مباشرة
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
          <div className="flex shrink-0 flex-col gap-3 border-b border-[#1e2a38]/8 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
                <FiBox size={16} />
                المنتجات المتاحة
              </h2>
              <span className="text-xs text-[#8a939e]">
                {activeProducts.length} منتج
              </span>
            </div>
            <BarcodeScanner
              autoFocus
              onScan={handleBarcodeScan}
              disabled={scanProduct.isLoading}
              placeholder="امسح الباركود / QR لإضافة للسلة..."
            />
            <div className="relative">
              <FiSearch
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a939e]"
                size={16}
              />
              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="بحث بالاسم أو SKU أو الباركود..."
                className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] py-2 pr-9 pl-3 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a]/50 focus:ring-1 focus:ring-[#9e7e3a]/20"
              />
            </div>
          </div>

          {productsLoading ? (
            <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
              جاري تحميل المنتجات...
            </div>
          ) : productsError ? (
            <div className="space-y-3 px-4 py-12 text-center">
              <p className="text-sm text-red-600" role="alert">
                {productsErr?.message || 'تعذر تحميل المنتجات'}
              </p>
              <button
                type="button"
                onClick={() => refetchProducts()}
                className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <ScrollableTable>
              <table className="w-full min-w-[420px] text-right text-sm">
                <thead className={stickyTheadClass}>
                  <tr>
                    <th className="px-3 py-3 font-semibold">المنتج</th>
                    <th className="px-3 py-3 font-semibold">SKU</th>
                    <th className="px-3 py-3 font-semibold">السعر</th>
                    <th className="px-3 py-3 font-semibold">المخزون</th>
                    <th className="px-3 py-3 font-semibold">إضافة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2a38]/6">
                  {activeProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-10 text-center text-sm text-[#5c6570]"
                      >
                        {productSearch.trim()
                          ? 'لا توجد نتائج مطابقة للبحث'
                          : 'لا توجد منتجات'}
                      </td>
                    </tr>
                  ) : (
                    activeProducts.map((product) => {
                      const qty =
                        stockByProduct.get(String(product._id)) ?? 0
                      const out = qty < 1
                      return (
                        <tr
                          key={product._id}
                          className={`transition ${
                            out ? 'opacity-50' : 'hover:bg-[#f7f5f2]/70'
                          }`}
                        >
                          <td className="px-3 py-3">
                            <p className="font-medium text-[#1e2a38]">
                              {product.name}
                            </p>
                            <p className="truncate text-[11px] text-[#8a939e]">
                              {product.description}
                            </p>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-[#3d4654]">
                            {product.sku}
                          </td>
                          <td className="px-3 py-3 font-semibold text-[#9e7e3a]">
                            {formatMoney(product.sellingPrice)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                out
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {out ? 'نفد' : qty}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              disabled={out}
                              onClick={() => addToCart(product)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#1e2a38] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2a3a4d] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <FiPlus size={12} />
                              إضافة
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </ScrollableTable>
          )}
        </section>

        <aside className="flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiShoppingBag size={16} />
              سلة الفاتورة
            </h2>
            <span className="text-xs text-[#8a939e]">{cart.length} صنف</span>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {cart.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#8a939e]">
                امسح الباركود أو اضغط إضافة من الجدول
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-xl border border-[#1e2a38]/8 bg-[#f7f5f2]/70 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1e2a38]">
                        {item.name}
                      </p>
                      <p className="font-mono text-[11px] text-[#8a939e]">
                        {item.sku}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      aria-label="حذف"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, -1)}
                        className="rounded-md border border-[#1e2a38]/10 p-1 hover:bg-white"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, 1)}
                        className="rounded-md border border-[#1e2a38]/10 p-1 hover:bg-white"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-[#1e2a38]">
                      {formatMoney(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitInvoice({ print: false })
            }}
            className="shrink-0 space-y-3 border-t border-[#1e2a38]/8 p-4"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="order-customer-name"
                  className="mb-1 block text-xs font-medium text-[#3d4654]"
                >
                  اسم العميل
                </label>
                <input
                  id="order-customer-name"
                  type="text"
                  placeholder="اختياري"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
                />
              </div>
              <div>
                <label
                  htmlFor="order-customer-phone"
                  className="mb-1 block text-xs font-medium text-[#3d4654]"
                >
                  هاتف العميل
                </label>
                <input
                  id="order-customer-phone"
                  type="text"
                  placeholder="اختياري"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="order-discount"
                  className="mb-1 block text-xs font-medium text-[#3d4654]"
                >
                  الخصم
                </label>
                <input
                  id="order-discount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
                />
              </div>
              <div>
                <label
                  htmlFor="order-tax"
                  className="mb-1 block text-xs font-medium text-[#3d4654]"
                >
                  الضريبة
                </label>
                <input
                  id="order-tax"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={tax}
                  onChange={(e) => {
                    setTaxTouched(true)
                    setTax(e.target.value)
                  }}
                  className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="order-payment-method"
                className="mb-1 block text-xs font-medium text-[#3d4654]"
              >
                طريقة الدفع
              </label>
              <select
                id="order-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
              >
                <option value={PAYMENT_METHODS.CASH}>نقدي</option>
                <option value={PAYMENT_METHODS.VISA}>فيزا</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="order-notes"
                className="mb-1 block text-xs font-medium text-[#3d4654]"
              >
                ملاحظات
              </label>
              <textarea
                id="order-notes"
                rows={2}
                placeholder="اختياري"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
              />
            </div>

            <div className="rounded-xl bg-[#1e2a38] p-3 text-white">
              <div className="flex justify-between text-xs text-white/70">
                <span>المجموع الفرعي</span>
                <span>{formatMoney(subTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-bold">
                <span>الإجمالي</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={!cart.length || submitting || createInvoice.isLoading}
                className="w-full rounded-lg border border-[#1e2a38]/20 bg-white py-2.5 text-sm font-semibold text-[#1e2a38] transition hover:bg-[#f7f5f2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting || createInvoice.isLoading
                  ? 'جاري الإصدار...'
                  : 'إصدار فاتورة'}
              </button>
              <button
                type="button"
                disabled={!cart.length || submitting || createInvoice.isLoading}
                onClick={() => submitInvoice({ print: true })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#9e7e3a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#b08f4a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiPrinter size={15} />
                {submitting || createInvoice.isLoading
                  ? 'جاري الإصدار...'
                  : 'إصدار وطباعة'}
              </button>
            </div>
          </form>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#1e2a38]/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiFileText size={16} />
              آخر الفواتير
            </h2>
            <Link
              to="/invoices"
              className="text-xs font-semibold text-[#9e7e3a] hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <FiSearch
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a939e]"
              size={16}
            />
            <input
              type="search"
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              placeholder="بحث برقم الفاتورة..."
              className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] py-2 pr-9 pl-3 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a]/50 focus:ring-1 focus:ring-[#9e7e3a]/20"
            />
          </div>
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
        ) : lookingUpNumber ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            جاري البحث عن الفاتورة...
          </div>
        ) : displayedInvoices.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
            {invoiceNumberQuery
              ? 'لا توجد فاتورة بهذا الرقم'
              : 'لا توجد فواتير بعد'}
          </div>
        ) : (
          <ScrollableTable>
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead className={stickyTheadClass}>
                <tr>
                  <th className="px-4 py-3 font-semibold">الرقم</th>
                  <th className="px-4 py-3 font-semibold">العميل</th>
                  <th className="px-4 py-3 font-semibold">الإجمالي</th>
                  <th className="px-4 py-3 font-semibold">الدفع</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a38]/6">
                {displayedInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-[#f7f5f2]/70">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1e2a38]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-[#3d4654]">
                      {inv.customerName || 'عميل نقدي'}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatMoney(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-xs">{inv.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
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
                      <Link
                        to={`/invoices/${inv._id}`}
                        className="rounded-lg p-2 text-[#5c6570] hover:bg-[#1e2a38]/5 hover:text-[#1e2a38]"
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
