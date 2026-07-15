import React, { useEffect, useId, useRef, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FiImage, FiUpload } from 'react-icons/fi'
import { RiBarcodeLine } from 'react-icons/ri'
import { resolveMediaUrl } from '../../helpers/Api'
import { appToast } from '../../helpers/toast'
import DevSimulateScan from '../barcode/DevSimulateScan'
import { playScanSuccess, unlockScanAudio } from '../../helpers/scanSounds'
import { handleBarcodeFieldKeyDown } from '../../hooks/useBarcodeScanner'
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts'

export const productSchema = Yup.object({
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
  image: Yup.mixed().nullable(),
})

export const emptyProductValues = {
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

export const mapProductToValues = (product) => ({
  sku: product?.sku || '',
  barcode: product?.barcode || '',
  name: product?.name || '',
  description: product?.description || '',
  categoryId: product?.categoryId?._id || product?.categoryId || '',
  supplierId: product?.supplierId?._id || product?.supplierId || '',
  costPrice: product?.costPrice ?? '',
  sellingPrice: product?.sellingPrice ?? '',
  initialQuantity: '',
  minimumQuantity:
    product?.stock?.minimumQuantity ?? product?.minimumQuantity ?? '',
  isActive: product?.isActive ?? true,
  image: null,
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

/**
 * Shared create/edit product form.
 * @param {'create'|'edit'} mode
 */
export default function ProductForm({
  mode = 'create',
  categories = [],
  suppliers = [],
  product = null,
  onSuccess,
  className = '',
  submitLabel,
}) {
  const isEdit = mode === 'edit'
  const productId = product?._id ?? null
  const fieldId = useId()
  const imageInputId = `${fieldId}-image`
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const formik = useFormik({
    initialValues: emptyProductValues,
    validationSchema: productSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!isEdit && !(values.image instanceof File)) {
        formik.setFieldTouched('image', true, false)
        formik.setFieldError('image', 'صورة المنتج مطلوبة')
        setSubmitting(false)
        return
      }

      const payload = {
        sku: values.sku.trim(),
        barcode: values.barcode?.trim() || '',
        name: values.name.trim(),
        description: values.description || '',
        categoryId: values.categoryId,
        supplierId: values.supplierId,
        costPrice: Number(values.costPrice),
        sellingPrice: Number(values.sellingPrice),
        minimumQuantity:
          values.minimumQuantity === '' || values.minimumQuantity == null
            ? 0
            : Number(values.minimumQuantity),
      }

      if (!isEdit) {
        if (values.initialQuantity !== '' && values.initialQuantity != null) {
          payload.initialQuantity = Number(values.initialQuantity)
        }
        payload.image = values.image
      } else {
        payload.isActive = Boolean(values.isActive)
        if (values.image instanceof File) {
          payload.image = values.image
        }
      }

      try {
        const result = isEdit
          ? await updateProduct.mutateAsync({ id: productId, payload })
          : await createProduct.mutateAsync(payload)

        appToast.success(
          result.message ||
            (isEdit ? 'تم تحديث المنتج بنجاح' : 'تم إنشاء المنتج بنجاح')
        )
        resetForm({ values: emptyProductValues })
        setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        onSuccess?.(result)
      } catch (error) {
        appToast.error(error?.message || 'تعذر حفظ المنتج')
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    if (isEdit && productId && product) {
      formik.resetForm({ values: mapProductToValues(product) })
    } else if (!isEdit) {
      formik.resetForm({ values: emptyProductValues })
    }
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, productId])

  const isBusy =
    formik.isSubmitting || createProduct.isLoading || updateProduct.isLoading

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  const onImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      formik.setFieldTouched('image', true, false)
      formik.setFieldError('image', 'يرجى اختيار ملف صورة صالح')
      return
    }
    formik.setFieldValue('image', file, false)
    formik.setFieldError('image', undefined)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const existingImage = resolveMediaUrl(product?.image)
  const displaySrc = preview || (isEdit ? existingImage : null)

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className={`space-y-4 ${className}`.trim()}
      >
        <div>
          <span className={labelClass} id={`${imageInputId}-label`}>
            صورة المنتج
          </span>
          <label
            htmlFor={imageInputId}
            aria-labelledby={`${imageInputId}-label`}
            className="relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-[#1e2a38]/20 bg-[#f7f5f2] px-4 py-6 text-center transition hover:border-[#9e7e3a]/50"
          >
            {displaySrc ? (
              <>
                <img
                  src={displaySrc}
                  alt="معاينة المنتج"
                  className="h-28 w-28 rounded-lg object-cover"
                />
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1e2a38] shadow-sm">
                  <FiUpload size={14} />
                  {preview ? 'تغيير الصورة المحددة' : 'تغيير الصورة'}
                </span>
              </>
            ) : (
              <>
                <FiImage className="text-[#8a939e]" size={28} />
                <span className="flex items-center gap-1.5 text-sm text-[#5c6570]">
                  <FiUpload size={14} />
                  اختر صورة للمنتج
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              id={imageInputId}
              name="image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onImageChange}
            />
          </label>
          {fieldError('image')}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-sku`}>
              SKU
            </label>
            <input
              id={`${fieldId}-sku`}
              type="text"
              placeholder="SUIT-001-55"
              className={inputClass}
              {...formik.getFieldProps('sku')}
            />
            {fieldError('sku')}
          </div>
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-barcode`}>
              الباركود / QR
            </label>
            <div className="relative">
              <RiBarcodeLine
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9e7e3a]"
                size={18}
              />
              <input
                id={`${fieldId}-barcode`}
                type="text"
                autoComplete="off"
                placeholder="امسح بجهاز القارئ أو اكتب يدوياً..."
                className={`${inputClass} pr-10`}
                {...formik.getFieldProps('barcode')}
                onPointerDown={() => {
                  unlockScanAudio()
                }}
                onKeyDown={(e) => {
                  unlockScanAudio()
                  handleBarcodeFieldKeyDown(e, { blur: true })
                  if (
                    (e.key === 'Enter' || e.key === 'Tab') &&
                    e.currentTarget.value?.trim()
                  ) {
                    playScanSuccess()
                  }
                }}
              />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <p className="text-[11px] text-[#8a939e]">
                اختياري — ضع المؤشر هنا وامسح بجهاز قارئ USB (Enter أو Tab) — بدون كاميرا
              </p>
              <DevSimulateScan
                disabled={isBusy}
                onSimulate={(code) => {
                  formik.setFieldValue('barcode', code, true)
                  formik.setFieldTouched('barcode', true, false)
                  playScanSuccess()
                }}
              />
            </div>
            {fieldError('barcode')}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-name`}>
            اسم المنتج
          </label>
          <input
            id={`${fieldId}-name`}
            type="text"
            placeholder="Classic Navy Suit"
            className={inputClass}
            {...formik.getFieldProps('name')}
          />
          {fieldError('name')}
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-description`}>
            الوصف
          </label>
          <textarea
            id={`${fieldId}-description`}
            rows={3}
            placeholder="Navy blue two-piece suit"
            className={`${inputClass} resize-none`}
            {...formik.getFieldProps('description')}
          />
          {fieldError('description')}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-categoryId`}>
              التصنيف
            </label>
            <select
              id={`${fieldId}-categoryId`}
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
            <label className={labelClass} htmlFor={`${fieldId}-supplierId`}>
              المورد
            </label>
            <select
              id={`${fieldId}-supplierId`}
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
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-costPrice`}>
              سعر التكلفة
            </label>
            <input
              id={`${fieldId}-costPrice`}
              type="number"
              min="0"
              placeholder="800"
              className={inputClass}
              {...formik.getFieldProps('costPrice')}
            />
            {fieldError('costPrice')}
          </div>
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-sellingPrice`}>
              سعر البيع
            </label>
            <input
              id={`${fieldId}-sellingPrice`}
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
            <label className={labelClass} htmlFor={`${fieldId}-initialQuantity`}>
              الكمية الابتدائية
            </label>
            <input
              id={`${fieldId}-initialQuantity`}
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
          <label className={labelClass} htmlFor={`${fieldId}-minimumQuantity`}>
            الحد الأدنى للمخزون
          </label>
          <input
            id={`${fieldId}-minimumQuantity`}
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
              onChange={(e) =>
                formik.setFieldValue('isActive', e.target.checked)
              }
              className="size-4 rounded border-[#1e2a38]/20"
            />
            المنتج نشط
          </label>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy
            ? 'جاري الحفظ...'
            : submitLabel ||
              (isEdit ? 'حفظ التعديلات' : 'حفظ المنتج')}
        </button>
      </form>
    </>
  )
}
