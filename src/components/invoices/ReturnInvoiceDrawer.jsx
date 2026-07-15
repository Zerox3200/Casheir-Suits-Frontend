import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import LeftDrawer from '../products/LeftDrawer'
import { useReturnInvoice } from '../../hooks/useInvoices'
import { appToast } from '../../helpers/toast'

const schema = Yup.object({
  returnReason: Yup.string().trim().required('سبب الإرجاع مطلوب'),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

export default function ReturnInvoiceDrawer({ open, onClose, invoice }) {
  const returnInvoice = useReturnInvoice()

  const formik = useFormik({
    initialValues: { returnReason: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!invoice?._id) {
        appToast.error('معرّف الفاتورة غير متاح')
        setSubmitting(false)
        return
      }
      try {
        const result = await returnInvoice.mutateAsync({
          id: invoice._id,
          returnReason: values.returnReason.trim(),
        })
        appToast.success(result.message || 'تم إرجاع الفاتورة بنجاح')
        resetForm()
        onClose()
      } catch (error) {
        appToast.error(error?.message || 'تعذر إرجاع الفاتورة')
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
    <LeftDrawer open={open} onClose={onClose} title="إرجاع فاتورة">
      {invoice && (
        <p className="mb-4 rounded-lg bg-[#f7f5f2] px-3 py-2 text-sm text-[#5c6570]">
          فاتورة{' '}
          <span className="font-semibold text-[#1e2a38]">
            {invoice.invoiceNumber}
          </span>
          {' · '}
          سيتم إرجاع المخزون وإيقاف الفاتورة كـ «مرتجعة»
        </p>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="returnReason">
            سبب الإرجاع
          </label>
          <textarea
            id="returnReason"
            rows={4}
            placeholder="مثال: المقاس غير مناسب"
            className={`${inputClass} resize-none`}
            {...formik.getFieldProps('returnReason')}
          />
          {formik.touched.returnReason && formik.errors.returnReason && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {formik.errors.returnReason}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting || returnInvoice.isLoading}
          className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {formik.isSubmitting || returnInvoice.isLoading
            ? 'جاري الإرجاع...'
            : 'تأكيد الإرجاع'}
        </button>
      </form>
    </LeftDrawer>
  )
}
