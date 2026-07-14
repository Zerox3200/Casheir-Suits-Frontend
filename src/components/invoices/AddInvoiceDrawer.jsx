import React, { useEffect, useMemo } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import LeftDrawer from '../products/LeftDrawer'
import { PAYMENT_METHODS } from '../../pages/Admin/invoicesMock'

const schema = Yup.object({
  customerName: Yup.string(),
  customerPhone: Yup.string(),
  items: Yup.array()
    .of(
      Yup.object({
        productId: Yup.string().required('معرّف المنتج مطلوب'),
        quantity: Yup.number()
          .typeError('الكمية مطلوبة')
          .integer('الكمية يجب أن تكون عدداً صحيحاً')
          .min(1, 'يجب أن تكون الكمية 1 على الأقل')
          .required('الكمية مطلوبة'),
      })
    )
    .min(1, 'يجب إضافة منتج واحد على الأقل')
    .required('عناصر الفاتورة مطلوبة'),
  discount: Yup.number()
    .typeError('الخصم غير صالح')
    .min(0, 'الخصم لا يمكن أن يكون سالبًا'),
  tax: Yup.number()
    .typeError('الضريبة غير صالحة')
    .min(0, 'الضريبة لا يمكن أن تكون سالبة'),
  paymentMethod: Yup.string()
    .oneOf(
      [PAYMENT_METHODS.CASH, PAYMENT_METHODS.VISA],
      'طريقة الدفع يجب أن تكون نقدي أو فيزا'
    )
    .required('طريقة الدفع مطلوبة'),
  notes: Yup.string(),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

const formatMoney = (value) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value || 0)

export default function AddInvoiceDrawer({ open, onClose, products }) {
  const formik = useFormik({
    initialValues: {
      customerName: '',
      customerPhone: '',
      items: [{ productId: '', quantity: 1 }],
      discount: 0,
      tax: 0,
      paymentMethod: PAYMENT_METHODS.CASH,
      notes: '',
    },
    validationSchema: schema,
    onSubmit: () => {
      onClose()
    },
  })

  useEffect(() => {
    if (!open) formik.resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const productMap = useMemo(() => {
    const map = new Map()
    products.forEach((p) => map.set(p._id, p))
    return map
  }, [products])

  const subTotal = formik.values.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)
    if (!product) return sum
    return sum + product.sellingPrice * Number(item.quantity || 0)
  }, 0)

  const discount = Number(formik.values.discount) || 0
  const tax = Number(formik.values.tax) || 0
  const total = Math.max(0, subTotal - discount + tax)

  const getItemError = (index, field) => {
    const touched = formik.touched.items?.[index]?.[field]
    const error = formik.errors.items?.[index]?.[field]
    if (touched && error) {
      return (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )
    }
    return null
  }

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  const addItem = () => {
    formik.setFieldValue('items', [
      ...formik.values.items,
      { productId: '', quantity: 1 },
    ])
  }

  const removeItem = (index) => {
    formik.setFieldValue(
      'items',
      formik.values.items.filter((_, i) => i !== index)
    )
  }

  return (
    <LeftDrawer open={open} onClose={onClose} title="إضافة فاتورة">
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="customerName">
              اسم العميل
            </label>
            <input
              id="customerName"
              type="text"
              placeholder="اختياري"
              className={inputClass}
              {...formik.getFieldProps('customerName')}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="customerPhone">
              هاتف العميل
            </label>
            <input
              id="customerPhone"
              type="text"
              placeholder="اختياري"
              className={inputClass}
              {...formik.getFieldProps('customerPhone')}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#1e2a38]">
            عناصر الفاتورة
          </label>

          <div className="space-y-3">
            {formik.values.items.map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#1e2a38]/8 bg-[#f7f5f2]/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#8a939e]">
                    منتج {index + 1}
                  </span>
                  {formik.values.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-md p-1 text-red-500 hover:bg-red-50"
                      aria-label="حذف المنتج"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <label
                      className={labelClass}
                      htmlFor={`items.${index}.productId`}
                    >
                      المنتج
                    </label>
                    <select
                      id={`items.${index}.productId`}
                      className={inputClass}
                      {...formik.getFieldProps(`items.${index}.productId`)}
                    >
                      <option value="">اختر المنتج</option>
                      {products
                        .filter((p) => p.isActive)
                        .map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} — {formatMoney(p.sellingPrice)} ج.م
                          </option>
                        ))}
                    </select>
                    {getItemError(index, 'productId')}
                  </div>
                  <div>
                    <label
                      className={labelClass}
                      htmlFor={`items.${index}.quantity`}
                    >
                      الكمية
                    </label>
                    <input
                      id={`items.${index}.quantity`}
                      type="number"
                      min="1"
                      className={inputClass}
                      {...formik.getFieldProps(`items.${index}.quantity`)}
                    />
                    {getItemError(index, 'quantity')}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1e2a38]/20 py-2.5 text-sm font-medium text-[#1e2a38] transition hover:border-[#9e7e3a]/50 hover:bg-[#9e7e3a]/5"
            >
              <FiPlus size={16} />
              إضافة منتج
            </button>
          </div>

          {typeof formik.errors.items === 'string' && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.items}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="discount">
              الخصم
            </label>
            <input
              id="discount"
              type="number"
              min="0"
              className={inputClass}
              {...formik.getFieldProps('discount')}
            />
            {fieldError('discount')}
          </div>
          <div>
            <label className={labelClass} htmlFor="tax">
              الضريبة
            </label>
            <input
              id="tax"
              type="number"
              min="0"
              className={inputClass}
              {...formik.getFieldProps('tax')}
            />
            {fieldError('tax')}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="paymentMethod">
            طريقة الدفع
          </label>
          <select
            id="paymentMethod"
            className={inputClass}
            {...formik.getFieldProps('paymentMethod')}
          >
            <option value={PAYMENT_METHODS.CASH}>نقدي</option>
            <option value={PAYMENT_METHODS.VISA}>فيزا</option>
          </select>
          {fieldError('paymentMethod')}
        </div>

        <div>
          <label className={labelClass} htmlFor="notes">
            ملاحظات
          </label>
          <textarea
            id="notes"
            rows={2}
            className={`${inputClass} resize-none`}
            {...formik.getFieldProps('notes')}
          />
        </div>

        <div className="rounded-xl border border-[#1e2a38]/10 bg-[#1e2a38] p-4 text-white">
          <div className="flex justify-between text-sm text-white/70">
            <span>المجموع الفرعي</span>
            <span>{formatMoney(subTotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-white/70">
            <span>الخصم</span>
            <span>- {formatMoney(discount)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-white/70">
            <span>الضريبة</span>
            <span>+ {formatMoney(tax)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-base font-bold">
            <span>الإجمالي</span>
            <span>{formatMoney(total)} ج.م</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full rounded-lg bg-[#9e7e3a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#b08f4a] disabled:opacity-60"
        >
          إنشاء الفاتورة
        </button>
      </form>
    </LeftDrawer>
  )
}
