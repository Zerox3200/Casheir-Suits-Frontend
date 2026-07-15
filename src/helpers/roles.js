import { ROLES } from '../constants/roles'
import { getAuthUser } from './cookies'

export function getCurrentUserRole() {
  return getAuthUser()?.role || null
}

export function isAdmin(user = getAuthUser()) {
  return user?.role === ROLES.ADMIN
}

export function isCashier(user = getAuthUser()) {
  return user?.role === ROLES.CASHIER
}

/** Routes / nav keys a cashier may open. */
export const CASHIER_ALLOWED_PATH_PREFIXES = [
  '/products',
  '/orders',
  '/invoices',
  '/stock',
]

export function isPathAllowedForRole(pathname, role) {
  if (role === ROLES.ADMIN) return true
  if (role !== ROLES.CASHIER) return false
  return CASHIER_ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/** Default landing path after login. */
export function getHomePathForRole(role) {
  if (role === ROLES.CASHIER) return '/orders'
  return '/products'
}
