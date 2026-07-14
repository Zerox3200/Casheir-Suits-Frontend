import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FiImage, FiUpload } from 'react-icons/fi'
import LeftDrawer from './LeftDrawer'

const createSchema = Yup.object({
  sku: Yup.string().trim().required('رمز SKU مطلوب'),
  barcode: Yup.string().trim(),
  name: Yup.string().trim().required('اسم المنتج مطلوب'),
  description: Yup.string(),
  categoryId: Yup.string().required('التصنيف مطلوب'),
  supplierId: Yup.string().required('المورد مطلوب'),
  costPrice: Yup.number()
    .typeError('سعر التكلفة مطلوب')
    .min(0, 'سعر التكلفة لا يمكن أن يكون سالبًا')
    .required('سعر التكلفة مطلوب'),
  sellingPrice: Yup.number()
    .typeError('سعر البيع مطلوب')
    .min(0, 'سعر البيع لا يمكن أن يكون سالبًا')
    .required('سعر البيع مطلوب'),
  initialQuantity: Yup.number()
    .typeError('الكمية الابتدائية غير صالحة')
    .min(0, 'الكمية الابتدائية لا يمكن أن تكون سالبة'),
  minimumQuantity: Yup.number()
    .typeError('الحد الأدنى غير صالح')
    .min(0, 'الحد الأدنى للمخزون لا يمكن أن يكون سالبًا'),
  isActive: Yup.boolean(),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

const emptyValues = {
  sku: '',
  barcode: '',
  name: '',
  description: '',
  categoryId: '',
  supplierId: '',
  costPrice: '',
  sellingPrice: '',
  initialQuantity: '',
  minimumQuantity: '',
  isActive: true,
  image: null,
}

const mapProductToValues = (product) => ({
  sku: product?.sku || '',
  barcode: product?.barcode || '',
  name: product?.name || '',
  description: product?.description || '',
  categoryId: product?.categoryId?._id || product?.categoryId || '',
  supplierId: product?.supplierId?._id || product?.supplierId || '',
  costPrice: product?.costPrice ?? '',
  sellingPrice: product?.sellingPrice ?? '',
  initialQuantity: '',
  minimumQuantity: product?.minimumQuantity ?? '',
  isActive: product?.isActive ?? true,
  image: null,
})

export default function AddProductDrawer({
  open,
  onClose,
  categories,
  suppliers,
  product = null,
}) {
  const isEdit = Boolean(product)
  const [preview, setPreview] = useState(null)

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: isEdit ? mapProductToValues(product) : emptyValues,
    validationSchema: createSchema,
    onSubmit: () => {
      onClose()
    },
  })

  useEffect(() => {
    if (!open) {
      formik.resetForm()
      setPreview(null)
      return
    }
    if (product) {
      formik.setValues(mapProductToValues(product))
      setPreview(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product])

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  const onImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    formik.setFieldValue('image', file)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <LeftDrawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل منتج' : 'إضافة منتج'}
    >
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="product-image">
            صورة المنتج
          </label>
          <label
            htmlFor="product-image"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#1e2a38]/20 bg-[#f7f5f2] px-4 py-6 text-center transition hover:border-[#9e7e3a]/50"
          >
            {preview ? (
              <img
                src={preview}
                alt="معاينة المنتج"
                className="h-28 w-28 rounded-lg object-cover"
              />
            ) : (
              <>
                <FiImage className="text-[#8a939e]" size={28} />
                <span className="flex items-center gap-1.5 text-sm text-[#5c6570]">
                  <FiUpload size={14} />
                  {isEdit ? 'تغيير الصورة (اختياري)' : 'اختر صورة (FormData)'}
                </span>
              </>
            )}
            <input
              id="product-image"
              name="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="sku">
              SKU
            </label>
            <input
              id="sku"
              type="text"
              placeholder="SUIT-001-55"
              className={inputClass}
              {...formik.getFieldProps('sku')}
            />
            {fieldError('sku')}
          </div>
          <div>
            <label className={labelClass} htmlFor="barcode">
              الباركود
            </label>
            <input
              id="barcode"
              type="text"
              placeholder="6223001000001"
              className={inputClass}
              {...formik.getFieldProps('barcode')}
            />
            {fieldError('barcode')}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="name">
            اسم المنتج
          </label>
          <input
            id="name"
            type="text"
            placeholder="Classic Navy Suit"
            className={inputClass}
            {...formik.getFieldProps('name')}
          />
          {fieldError('name')}
        </div>

        <div>
          <label className={labelClass} htmlFor="description">
            الوصف
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Navy blue two-piece suit"
            className={`${inputClass} resize-none`}
            {...formik.getFieldProps('description')}
          />
          {fieldError('description')}
        </div>

        <div>
          <label className={labelClass} htmlFor="categoryId">
            التصنيف
          </label>
          <select
            id="categoryId"
            className={inputClass}
            {...formik.getFieldProps('categoryId')}
          >
            <option value="">اختر التصنيف</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldError('categoryId')}
        </div>

        <div>
          <label className={labelClass} htmlFor="supplierId">
            المورد
          </label>
          <select
            id="supplierId"
            className={inputClass}
            {...formik.getFieldProps('supplierId')}
          >
            <option value="">اختر المورد</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          {fieldError('supplierId')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="costPrice">
              سعر التكلفة
            </label>
            <input
              id="costPrice"
              type="number"
              min="0"
              placeholder="800"
              className={inputClass}
              {...formik.getFieldProps('costPrice')}
            />
            {fieldError('costPrice')}
          </div>
          <div>
            <label className={labelClass} htmlFor="sellingPrice">
              سعر البيع
            </label>
            <input
              id="sellingPrice"
              type="number"
              min="0"
              placeholder="1500"
              className={inputClass}
              {...formik.getFieldProps('sellingPrice')}
            />
            {fieldError('sellingPrice')}
          </div>
        </div>

        {!isEdit && (
          <div>
            <label className={labelClass} htmlFor="initialQuantity">
              الكمية الابتدائية
            </label>
            <input
              id="initialQuantity"
              type="number"
              min="0"
              placeholder="20"
              className={inputClass}
              {...formik.getFieldProps('initialQuantity')}
            />
            {fieldError('initialQuantity')}
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="minimumQuantity">
            الحد الأدنى للمخزون
          </label>
          <input
            id="minimumQuantity"
            type="number"
            min="0"
            placeholder="5"
            className={inputClass}
            {...formik.getFieldProps('minimumQuantity')}
          />
          {fieldError('minimumQuantity')}
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-[#3d4654]">
            <input
              type="checkbox"
              checked={formik.values.isActive}
              onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
              className="size-4 rounded border-[#1e2a38]/20"
            />
            المنتج نشط
          </label>
        )}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] disabled:opacity-60"
        >
          {isEdit ? 'حفظ التعديلات' : 'حفظ المنتج'}
        </button>
      </form>
    </LeftDrawer>
  )
}
