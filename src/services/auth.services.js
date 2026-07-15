import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'
import {
  clearAuthCookies,
  getAuthToken,
  setAuthToken,
  setAuthUser,
} from '../helpers/cookies'

const AUTH_PREFIX = '/auth'

/** @deprecated Prefer getApiError — kept for existing call sites */
export function getAuthError(error) {
  return getApiError(error)
}

export function persistAuthSession({ token, user }) {
  if (token) setAuthToken(token)
  if (user) setAuthUser(user)
}

export function clearAuthSession() {
  clearAuthCookies()
}

export async function loginService(email, password) {
  try {
    const response = await api.post(`${AUTH_PREFIX}/login`, { email, password })
    const result = unwrapResponse(response)
    if (result.success && result.data?.token) {
      persistAuthSession({
        token: result.data.token,
        user: result.data.user,
      })
    }
    return result
  } catch (error) {
    return getApiError(error)
  }
}

export async function getMeService() {
  try {
    const response = await api.get(`${AUTH_PREFIX}/me`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

/** Sync cookie user from GET /auth/me; clears session if token is invalid. */
export async function refreshAuthUserFromMe() {
  if (!getAuthToken()) {
    return { success: false, message: 'لا توجد جلسة', data: null }
  }

  const result = await getMeService()
  if (result.success && result.data?.user) {
    setAuthUser(result.data.user)
    return result
  }

  clearAuthSession()
  return result
}

export async function listUsersService() {
  try {
    const response = await api.get(`${AUTH_PREFIX}/users`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function createUserService(payload) {
  try {
    const response = await api.post(`${AUTH_PREFIX}/users`, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function updateUserPasswordService(userId, payload) {
  try {
    const response = await api.patch(
      `${AUTH_PREFIX}/users/${userId}/password`,
      payload
    )
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
