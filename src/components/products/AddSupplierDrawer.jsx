import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import LeftDrawer from './LeftDrawer'
import { appToast } from '../../helpers/toast'
import { useCreateSupplier } from '../../hooks/useSuppliers'

const schema = Yup.object({
  name: Yup.string().trim().required('اسم المورد مطلوب'),
  phone: Yup.string(),
  address: Yup.string(),
  notes: Yup.string(),
  isActive: Yup.boolean(),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

export default function AddSupplierDrawer({ open, onClose }) {
  const createSupplier = useCreateSupplier()

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      address: '',
      notes: '',
      isActive: true,
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const result = await createSupplier.mutateAsync({
          name: values.name.trim(),
          phone: values.phone || '',
          address: values.address || '',
          notes: values.notes || '',
          isActive: Boolean(values.isActive),
        })
        appToast.success(result.message || 'تم إنشاء المورد بنجاح')
        resetForm()
        onClose()
      } catch (error) {
        appToast.error(error?.message || 'تعذر إنشاء المورد')
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    if (!open) formik.resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isBusy = formik.isSubmitting || createSupplier.isLoading

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  return (
    <LeftDrawer open={open} onClose={onClose} title="إضافة مورد">
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="supplier-name">
            اسم المورد
          </label>
          <input
            id="supplier-name"
            type="text"
            className={inputClass}
            {...formik.getFieldProps('name')}
          />
          {fieldError('name')}
        </div>
        <div>
          <label className={labelClass} htmlFor="supplier-phone">
            الهاتف
          </label>
          <input
            id="supplier-phone"
            type="text"
            className={inputClass}
            {...formik.getFieldProps('phone')}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="supplier-address">
            العنوان
          </label>
          <input
            id="supplier-address"
            type="text"
            className={inputClass}
            {...formik.getFieldProps('address')}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="supplier-notes">
            ملاحظات
          </label>
          <textarea
            id="supplier-notes"
            rows={3}
            className={`${inputClass} resize-none`}
            {...formik.getFieldProps('notes')}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#3d4654]">
          <input
            type="checkbox"
            checked={formik.values.isActive}
            onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
            className="size-4 rounded border-[#1e2a38]/20"
          />
          المورد نشط
        </label>
        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? 'جاري الحفظ...' : 'حفظ المورد'}
        </button>
      </form>
    </LeftDrawer>
  )
}
