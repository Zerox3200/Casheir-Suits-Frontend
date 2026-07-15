import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { refreshAuthUserFromMe } from '../services/auth.services'
import { getAuthToken, getAuthUser } from '../helpers/cookies'

/** Requires valid session (token + user); syncs user from GET /auth/me */
export default function RequireAuth() {
  const token = getAuthToken()
  const [sessionReady, setSessionReady] = useState(!token)

  useEffect(() => {
    if (!token) {
      setSessionReady(true)
      return undefined
    }

    let cancelled = false

    refreshAuthUserFromMe().finally(() => {
      if (!cancelled) setSessionReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [token])

  if (!sessionReady) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f5f2] text-sm text-[#5c6570]"
        style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
      >
        جاري التحقق من الجلسة...
      </div>
    )
  }

  if (!token || !getAuthUser()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
