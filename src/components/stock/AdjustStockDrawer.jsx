import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import LeftDrawer from '../products/LeftDrawer'
import { STOCK_ADJUST_REASON } from '../../constants/stock'
import { useAdjustStock } from '../../hooks/useStock'
import { appToast } from '../../helpers/toast'

const schema = Yup.object({
  quantity: Yup.number()
    .typeError('الكمية مطلوبة')
    .min(0, 'الكمية لا يمكن أن تكون سالبة')
    .required('الكمية مطلوبة'),
  reason: Yup.string()
    .oneOf(Object.values(STOCK_ADJUST_REASON), 'سبب التعديل غير صالح')
    .required('سبب التعديل مطلوب'),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

export default function AdjustStockDrawer({ open, onClose, stockItem }) {
  const adjustStock = useAdjustStock()
  const product = stockItem?.productId
  const productId = product?._id || product || null

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      quantity: stockItem?.quantity ?? 0,
      reason: STOCK_ADJUST_REASON.MANUAL,
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!productId) {
        appToast.error('معرف المنتج غير متاح')
        setSubmitting(false)
        return
      }
      try {
        const result = await adjustStock.mutateAsync({
          productId,
          quantity: Number(values.quantity),
          reason: values.reason,
        })
        appToast.success(result.message || 'تم تعديل المخزون بنجاح')
        onClose()
      } catch (error) {
        appToast.error(error?.message || 'تعذر تعديل المخزون')
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    if (!open) formik.resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <LeftDrawer open={open} onClose={onClose} title="تعديل كمية المخزون">
      {product && (
        <div className="mb-4 rounded-xl border border-[#1e2a38]/8 bg-[#f7f5f2] p-4">
          <p className="font-semibold text-[#1e2a38]">
            {product.name || '—'}
          </p>
          <p className="mt-1 font-mono text-xs text-[#8a939e]">
            {product.sku || '—'}
          </p>
          <p className="mt-2 text-sm text-[#5c6570]">
            الكمية الحالية:{' '}
            <span className="font-bold text-[#1e2a38]">
              {stockItem.quantity}
            </span>
          </p>
          <p className="text-xs text-[#8a939e]">
            الحد الأدنى: {stockItem.minimumQuantity}
          </p>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="quantity">
            الكمية الجديدة
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            className={inputClass}
            {...formik.getFieldProps('quantity')}
          />
          {formik.touched.quantity && formik.errors.quantity && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.quantity}</p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="reason">
            سبب التعديل
          </label>
          <select
            id="reason"
            className={inputClass}
            {...formik.getFieldProps('reason')}
          >
            {Object.values(STOCK_ADJUST_REASON).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {formik.touched.reason && formik.errors.reason && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.reason}</p>
          )}
        </div>

        <p className="text-xs leading-relaxed text-[#8a939e]">
          سيتم تسجيل حركة مخزون تلقائياً (دخول / خروج) حسب الفرق والسبب.
        </p>

        <button
          type="submit"
          disabled={formik.isSubmitting || adjustStock.isLoading}
          className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] disabled:opacity-60"
        >
          {formik.isSubmitting || adjustStock.isLoading
            ? 'جاري الحفظ...'
            : 'حفظ التعديل'}
        </button>
      </form>
    </LeftDrawer>
  )
}
