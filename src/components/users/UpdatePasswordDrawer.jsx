import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import LeftDrawer from '../products/LeftDrawer'
import { useUpdateUserPassword } from '../../hooks/useUsers'
import { appToast } from '../../helpers/toast'

const schema = Yup.object({
  password: Yup.string()
    .min(9, 'يجب أن تكون كلمة المرور 9 أحرف على الأقل')
    .required('كلمة المرور مطلوبة'),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref('password')], 'كلمتا المرور غير متطابقتين')
    .required('تأكيد كلمة المرور مطلوب'),
})

const inputClass =
  'w-full rounded-lg border border-[#1e2a38]/10 bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#1e2a38] outline-none transition focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25'
const labelClass = 'mb-1.5 block text-sm text-[#3d4654]'

export default function UpdatePasswordDrawer({ open, onClose, user }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const updatePassword = useUpdateUserPassword()

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmpassword: '',
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!user?._id) {
        appToast.error('معرّف المستخدم غير متاح')
        setSubmitting(false)
        return
      }
      try {
        const result = await updatePassword.mutateAsync({
          userId: user._id,
          password: values.password,
          confirmpassword: values.confirmpassword,
        })
        appToast.success(result.message || 'تم تحديث كلمة المرور بنجاح')
        resetForm()
        onClose()
      } catch (error) {
        appToast.error(error?.message || 'تعذر تحديث كلمة المرور')
      } finally {
        setSubmitting(false)
      }
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

  const isBusy = formik.isSubmitting || updatePassword.isLoading

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  return (
    <LeftDrawer open={open} onClose={onClose} title="تحديث كلمة المرور">
      {user && (
        <div className="mb-4 rounded-xl border border-[#1e2a38]/8 bg-[#f7f5f2] p-4">
          <p className="font-semibold text-[#1e2a38]">{user.name}</p>
          <p className="mt-1 text-xs text-[#8a939e]">{user.email}</p>
          <p className="mt-1 text-[11px] text-[#5c6570]">{user.role}</p>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="update-password">
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              id="update-password"
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
              aria-label={
                showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
              }
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {fieldError('password')}
        </div>

        <div>
          <label className={labelClass} htmlFor="update-confirmpassword">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <input
              id="update-confirmpassword"
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
                showConfirm
                  ? 'إخفاء تأكيد كلمة المرور'
                  : 'إظهار تأكيد كلمة المرور'
              }
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {fieldError('confirmpassword')}
        </div>

        <p className="text-xs leading-relaxed text-[#8a939e]">
          سيتم تعيين كلمة المرور الجديدة مباشرة دون الحاجة لكلمة المرور القديمة.
        </p>

        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? 'جاري التحديث...' : 'حفظ كلمة المرور'}
        </button>
      </form>
    </LeftDrawer>
  )
}
