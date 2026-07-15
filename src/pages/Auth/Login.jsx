import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi'
import { loginService } from '../../services/auth.services'
import { getAuthToken, getAuthUser } from '../../helpers/cookies'
import { getHomePathForRole } from '../../helpers/roles'
import { appToast } from '../../helpers/toast'

const loginSchema = Yup.object({
  email: Yup.string()
    .email('البريد الإلكتروني غير صالح')
    .required('البريد الإلكتروني مطلوب'),
  password: Yup.string()
    .min(9, 'كلمة المرور يجب ألا تقل عن ٩ أحرف')
    .required('كلمة المرور مطلوبة'),
})

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const isLoggedIn = Boolean(getAuthToken() && getAuthUser())

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const result = await loginService(values.email, values.password)
      setSubmitting(false)

      if (!result.success) {
        appToast.error(result.message)
        return
      }

      appToast.success(result.message || 'تم تسجيل الدخول بنجاح')
      const role = result.data?.user?.role || getAuthUser()?.role
      navigate(getHomePathForRole(role), { replace: true })
    },
  })

  if (isLoggedIn) {
    return <Navigate to={getHomePathForRole(getAuthUser()?.role)} replace />
  }

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1.5 text-xs text-red-600" role="alert">
        {formik.errors[name]}
      </p>
    ) : null

  return (
    <div
      dir="rtl"
      lang="ar"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
        background:
          'linear-gradient(160deg, #f7f5f2 0%, #ebe6df 45%, #e2ddd4 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(30, 42, 56, 0.06) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(158, 126, 58, 0.12) 0%, transparent 40%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold tracking-wide text-[#9e7e3a]">
            محل البدل · Suits Shop
          </p>
          <h1 className="mb-2 text-3xl font-bold text-[#1e2a38]">
            أهلاً بك، صاحب المحل
          </h1>
          <p className="text-sm leading-relaxed text-[#5c6570]">
            سجّل دخولك لإدارة المبيعات والكاشير في متجرك
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="rounded-2xl border border-[#1e2a38]/8 bg-white/80 p-6 shadow-[0_20px_50px_-24px_rgba(30,42,56,0.35)] backdrop-blur-sm md:p-8"
        >
          <h2 className="mb-6 text-xl font-semibold text-[#1e2a38]">
            تسجيل الدخول
          </h2>

          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm text-[#3d4654]">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <FiMail
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a939e]"
                size={18}
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@suits.com"
                className={`w-full rounded-lg border bg-[#f7f5f2] py-2.5 pr-10 pl-3 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25 ${formik.touched.email && formik.errors.email
                    ? 'border-red-400'
                    : 'border-[#1e2a38]/10'
                  }`}
                {...formik.getFieldProps('email')}
              />
            </div>
            {fieldError('email')}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-[#3d4654]"
            >
              كلمة المرور
            </label>
            <div className="relative">
              <FiLock
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a939e]"
                size={18}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full rounded-lg border bg-[#f7f5f2] py-2.5 pr-10 pl-10 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a]/60 focus:ring-1 focus:ring-[#9e7e3a]/25 ${formik.touched.password && formik.errors.password
                    ? 'border-red-400'
                    : 'border-[#1e2a38]/10'
                  }`}
                {...formik.getFieldProps('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a939e] transition hover:text-[#1e2a38]"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {fieldError('password')}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full rounded-lg bg-[#1e2a38] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formik.isSubmitting ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
