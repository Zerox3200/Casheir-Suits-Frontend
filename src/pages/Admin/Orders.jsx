import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBox,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiShoppingBag,
  FiFileText,
  FiEye,
} from 'react-icons/fi'
import { mockProducts } from './productsMock'
import { mockInvoices, PAYMENT_METHODS, INVOICE_STATUS } from './invoicesMock'
import { mockStock } from './stockMock'

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

export default function Orders() {
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH)
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [notes, setNotes] = useState('')
  const [checkoutDone, setCheckoutDone] = useState(false)

  const stockByProduct = useMemo(() => {
    const map = new Map()
    mockStock.forEach((s) => map.set(s.productId._id, s.quantity))
    return map
  }, [])

  const activeProducts = mockProducts.filter((p) => p.isActive)

  const addToCart = (product) => {
    setCheckoutDone(false)
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id)
      const stockQty = stockByProduct.get(product._id) ?? 0
      if (existing) {
        if (existing.quantity >= stockQty) return prev
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      if (stockQty < 1) return prev
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku,
          unitPrice: product.sellingPrice,
          unitCost: product.costPrice,
          quantity: 1,
        },
      ]
    })
  }

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i
          const stockQty = stockByProduct.get(productId) ?? 0
          const next = Math.min(stockQty, Math.max(0, i.quantity + delta))
          return { ...i, quantity: next }
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  const subTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const total = Math.max(0, subTotal - Number(discount || 0) + Number(tax || 0))

  const submitInvoice = (e) => {
    e.preventDefault()
    if (!cart.length) return
    setCheckoutDone(true)
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setDiscount(0)
    setTax(0)
    setNotes('')
    setPaymentMethod(PAYMENT_METHODS.CASH)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1e2a38]">إدارة الأوردرات</h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          نقطة البيع · اختر منتجات وأنشئ فاتورة مباشرة
        </p>
      </div>

      {checkoutDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          تم تجهيز الفاتورة بنجاح (واجهة فقط — بدون إرسال للخادم)
        </div>
      )}

      {/* 50% products table · 50% cart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiBox size={16} />
              المنتجات المتاحة
            </h2>
            <span className="text-xs text-[#8a939e]">
              {activeProducts.length} منتج
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[420px] text-right text-sm">
              <thead className="sticky top-0 bg-[#f7f5f2] text-xs text-[#5c6570]">
                <tr>
                  <th className="px-3 py-3 font-semibold">المنتج</th>
                  <th className="px-3 py-3 font-semibold">SKU</th>
                  <th className="px-3 py-3 font-semibold">السعر</th>
                  <th className="px-3 py-3 font-semibold">المخزون</th>
                  <th className="px-3 py-3 font-semibold">إضافة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a38]/6">
                {activeProducts.map((product) => {
                  const qty = stockByProduct.get(product._id) ?? 0
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
                })}
              </tbody>
            </table>
          </div>
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
                اضغط إضافة من جدول المنتجات
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
            onSubmit={submitInvoice}
            className="shrink-0 space-y-3 border-t border-[#1e2a38]/8 p-4"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="اسم العميل"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
              />
              <input
                type="text"
                placeholder="الهاتف"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none focus:border-[#9e7e3a]/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                placeholder="خصم"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none"
              />
              <input
                type="number"
                min="0"
                placeholder="ضريبة"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none"
              />
            </div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none"
            >
              <option value={PAYMENT_METHODS.CASH}>نقدي</option>
              <option value={PAYMENT_METHODS.VISA}>فيزا</option>
            </select>
            <textarea
              rows={2}
              placeholder="ملاحظات"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-2.5 py-2 text-xs outline-none"
            />

            <div className="rounded-xl bg-[#1e2a38] p-3 text-white">
              <div className="flex justify-between text-xs text-white/70">
                <span>الفرعي</span>
                <span>{formatMoney(subTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-bold">
                <span>الإجمالي</span>
                <span>{formatMoney(total)} ج.م</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!cart.length}
              className="w-full rounded-lg bg-[#9e7e3a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#b08f4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              إصدار فاتورة
            </button>
          </form>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
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
              {mockInvoices.map((inv) => (
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
        </div>
      </section>
    </div>
  )
}
