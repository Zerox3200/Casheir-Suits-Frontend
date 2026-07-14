import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import LeftDrawer from './LeftDrawer'

const schema = Yup.object({
  name: Yup.string().trim().required('اسم التصنيف مطلوب'),
  description: Yup.string(),
  isActive: Yup.boolean(),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

export default function AddCategoryDrawer({ open, onClose }) {
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      isActive: true,
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

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  return (
    <LeftDrawer open={open} onClose={onClose} title="إضافة نوع منتج">
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="category-name">
            اسم التصنيف
          </label>
          <input
            id="category-name"
            type="text"
            placeholder="مثال: بدلات رسمية"
            className={inputClass}
            {...formik.getFieldProps('name')}
          />
          {fieldError('name')}
        </div>

        <div>
          <label className={labelClass} htmlFor="category-description">
            الوصف
          </label>
          <textarea
            id="category-description"
            rows={3}
            placeholder="وصف مختصر للتصنيف"
            className={`${inputClass} resize-none`}
            {...formik.getFieldProps('description')}
          />
          {fieldError('description')}
        </div>

        <label className="flex items-center gap-2 text-sm text-[#3d4654]">
          <input
            type="checkbox"
            checked={formik.values.isActive}
            onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
            className="size-4 rounded border-[#1e2a38]/20 text-[#9e7e3a] focus:ring-[#9e7e3a]/30"
          />
          التصنيف نشط
        </label>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] disabled:opacity-60"
        >
          حفظ التصنيف
        </button>
      </form>
    </LeftDrawer>
  )
}
