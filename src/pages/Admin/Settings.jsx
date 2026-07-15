import React, { useEffect, useId, useRef, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FiImage, FiSave, FiUpload } from 'react-icons/fi'
import {
  RECEIPT_WIDTH,
  RECEIPT_WIDTH_OPTIONS,
} from '../../constants/receipt'
import { resolveMediaUrl } from '../../helpers/Api'
import { appToast } from '../../helpers/toast'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'

const schema = Yup.object({
  storeName: Yup.string().trim(),
  phone: Yup.string().trim(),
  address: Yup.string().trim(),
  currency: Yup.string().trim().required('العملة مطلوبة'),
  defaultTax: Yup.number()
    .typeError('ضريبة غير صالحة')
    .min(0, 'الضريبة لا يمكن أن تكون سالبة'),
  receiptFooter: Yup.string(),
  receiptWidth: Yup.string()
    .oneOf(Object.values(RECEIPT_WIDTH), 'عرض الإيصال غير صالح')
    .required(),
  taxNumber: Yup.string().trim(),
  companyRegNumber: Yup.string().trim(),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

export default function Settings() {
  const fieldId = useId()
  const fileRef = useRef(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const { data: settings, isLoading, isError, error, refetch } = useSettings()
  const updateSettings = useUpdateSettings()

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      storeName: settings?.storeName ?? '',
      phone: settings?.phone ?? '',
      address: settings?.address ?? '',
      currency: settings?.currency ?? 'EGP',
      defaultTax: settings?.defaultTax ?? 0,
      receiptFooter: settings?.receiptFooter ?? '',
      receiptWidth: settings?.receiptWidth ?? RECEIPT_WIDTH.MM_80,
      taxNumber: settings?.taxNumber ?? '',
      companyRegNumber: settings?.companyRegNumber ?? '',
      logo: null,
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await updateSettings.mutateAsync({
          storeName: values.storeName.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          currency: values.currency.trim() || 'EGP',
          defaultTax: Number(values.defaultTax) || 0,
          receiptFooter: values.receiptFooter,
          receiptWidth: values.receiptWidth,
          taxNumber: values.taxNumber.trim(),
          companyRegNumber: values.companyRegNumber.trim(),
          logo: values.logo instanceof File ? values.logo : undefined,
        })
        appToast.success(result.message || 'تم حفظ الإعدادات')
        setLogoPreview(null)
        if (fileRef.current) fileRef.current.value = ''
        formik.setFieldValue('logo', null)
      } catch (err) {
        appToast.error(err?.message || 'تعذر حفظ الإعدادات')
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    setLogoPreview(null)
  }, [settings?._id, settings?.logo])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center text-sm text-[#5c6570] shadow-sm">
        جاري تحميل الإعدادات...
      </div>
    )
  }

  if (isError && !settings) {
    return (
      <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-red-600" role="alert">
          {error?.message || 'تعذر تحميل الإعدادات'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  const currentLogo = logoPreview || resolveMediaUrl(settings?.logo)
  const busy = formik.isSubmitting || updateSettings.isLoading

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1e2a38]">إعدادات المتجر</h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          بيانات الإيصال الحراري · الاسم · الشعار · عرض الطباعة
        </p>
      </div>

      <form
        onSubmit={formik.handleSubmit}
        className="space-y-4 rounded-2xl border border-[#1e2a38]/8 bg-white p-5 shadow-sm"
      >
        <div>
          <p className={labelClass}>شعار المتجر</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2]">
              {currentLogo ? (
                <img
                  src={currentLogo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <FiImage className="text-[#8a939e]" size={28} />
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                id={`${fieldId}-logo`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  formik.setFieldValue('logo', file)
                  setLogoPreview(URL.createObjectURL(file))
                }}
              />
              <label
                htmlFor={`${fieldId}-logo`}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#1e2a38]/15 bg-white px-3 py-2 text-sm font-semibold text-[#1e2a38] hover:bg-[#f7f5f2]"
              >
                <FiUpload size={14} />
                رفع شعار
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-storeName`}>
            اسم المتجر
          </label>
          <input
            id={`${fieldId}-storeName`}
            className={inputClass}
            {...formik.getFieldProps('storeName')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-phone`}>
              الهاتف
            </label>
            <input
              id={`${fieldId}-phone`}
              className={inputClass}
              {...formik.getFieldProps('phone')}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-currency`}>
              العملة
            </label>
            <input
              id={`${fieldId}-currency`}
              className={inputClass}
              placeholder="EGP"
              {...formik.getFieldProps('currency')}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-address`}>
            العنوان
          </label>
          <textarea
            id={`${fieldId}-address`}
            rows={2}
            className={inputClass}
            {...formik.getFieldProps('address')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-receiptWidth`}>
              عرض إيصال الطابعة
            </label>
            <select
              id={`${fieldId}-receiptWidth`}
              className={inputClass}
              {...formik.getFieldProps('receiptWidth')}
            >
              {RECEIPT_WIDTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-defaultTax`}>
              الضريبة الافتراضية
            </label>
            <input
              id={`${fieldId}-defaultTax`}
              type="number"
              min="0"
              className={inputClass}
              {...formik.getFieldProps('defaultTax')}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-receiptFooter`}>
            تذييل الإيصال
          </label>
          <textarea
            id={`${fieldId}-receiptFooter`}
            rows={2}
            className={inputClass}
            placeholder="شكراً لتسوقكم معنا"
            {...formik.getFieldProps('receiptFooter')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${fieldId}-taxNumber`}>
              الرقم الضريبي (اختياري)
            </label>
            <input
              id={`${fieldId}-taxNumber`}
              className={inputClass}
              {...formik.getFieldProps('taxNumber')}
            />
          </div>
          <div>
            <label
              className={labelClass}
              htmlFor={`${fieldId}-companyRegNumber`}
            >
              السجل التجاري (اختياري)
            </label>
            <input
              id={`${fieldId}-companyRegNumber`}
              className={inputClass}
              {...formik.getFieldProps('companyRegNumber')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#9e7e3a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#b08f4a] disabled:opacity-50 sm:w-auto sm:px-6"
        >
          <FiSave size={16} />
          {busy ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  )
}
