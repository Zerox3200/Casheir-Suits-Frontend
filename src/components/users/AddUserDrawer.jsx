import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import LeftDrawer from '../products/LeftDrawer'
import { ROLES } from '../../pages/Admin/usersMock'

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'يجب أن يكون الاسم حرفين على الأقل')
    .max(50, 'يجب ألا يتجاوز الاسم 50 حرفًا')
    .required('الاسم مطلوب'),
  email: Yup.string()
    .email('يرجى إدخال بريد إلكتروني صالح')
    .required('البريد الإلكتروني مطلوب'),
  password: Yup.string()
    .min(9, 'يجب أن تكون كلمة المرور 9 أحرف على الأقل')
    .required('كلمة المرور مطلوبة'),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref('password')], 'كلمتا المرور غير متطابقتين')
    .required('تأكيد كلمة المرور مطلوب'),
  phone: Yup.string().trim().required('رقم الهاتف مطلوب'),
  role: Yup.string()
    .oneOf([ROLES.ADMIN, ROLES.CASHIER], 'الدور يجب أن يكون مسؤول أو كاشير')
    .required('الدور مطلوب'),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

export default function AddUserDrawer({ open, onClose }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmpassword: '',
      phone: '',
      role: ROLES.CASHIER,
    },
    validationSchema: schema,
    onSubmit: () => {
      onClose()
    },
  })

  useEffect(() => {
    if (!open) {
      formik.resetForm()
      setShowPassword(false)
      setShowConfirm(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  return (
    <LeftDrawer open={open} onClose={onClose} title="إضافة مستخدم">
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="user-name">
            الاسم
          </label>
          <input
            id="user-name"
            type="text"
            autoComplete="name"
            placeholder="اسم المستخدم"
            className={inputClass}
            {...formik.getFieldProps('name')}
          />
          {fieldError('name')}
        </div>

        <div>
          <label className={labelClass} htmlFor="user-email">
            البريد الإلكتروني
          </label>
          <input
            id="user-email"
            type="email"
            autoComplete="email"
            placeholder="user@suits.com"
            className={inputClass}
            {...formik.getFieldProps('email')}
          />
          {fieldError('email')}
        </div>

        <div>
          <label className={labelClass} htmlFor="user-phone">
            رقم الهاتف
          </label>
          <input
            id="user-phone"
            type="text"
            autoComplete="tel"
            placeholder="01xxxxxxxxx"
            className={inputClass}
            {...formik.getFieldProps('phone')}
          />
          {fieldError('phone')}
        </div>

        <div>
          <label className={labelClass} htmlFor="user-role">
            الدور
          </label>
          <select
            id="user-role"
            className={inputClass}
            {...formik.getFieldProps('role')}
          >
            <option value={ROLES.CASHIER}>{ROLES.CASHIER}</option>
            <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
          </select>
          {fieldError('role')}
        </div>

        <div>
          <label className={labelClass} htmlFor="user-password">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              id="user-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="٩ أحرف على الأقل"
              className={`${inputClass} pl-10`}
              {...formik.getFieldProps('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a939e] hover:text-[#1e2a38]"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {fieldError('password')}
        </div>

        <div>
          <label className={labelClass} htmlFor="user-confirmpassword">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <input
              id="user-confirmpassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className={`${inputClass} pl-10`}
              {...formik.getFieldProps('confirmpassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a939e] hover:text-[#1e2a38]"
              aria-label={
                showConfirm ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'
              }
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {fieldError('confirmpassword')}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] disabled:opacity-60"
        >
          حفظ المستخدم
        </button>
      </form>
    </LeftDrawer>
  )
}
