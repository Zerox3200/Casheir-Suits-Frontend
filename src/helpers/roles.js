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

/** Routes a cashier may open (orders + invoice detail/receipt after sale). */
export const CASHIER_ALLOWED_PATH_PREFIXES = ['/orders']

export function isPathAllowedForRole(pathname, role) {
  if (role === ROLES.ADMIN) return true
  if (role !== ROLES.CASHIER) return false
  if (pathname === '/orders' || pathname.startsWith('/orders/')) return true
  // Invoice detail or receipt — not the invoices list
  if (/^\/invoices\/[^/]+/.test(pathname)) return true
  return false
}

/** Default landing path after login. */
export function getHomePathForRole(role) {
  if (role === ROLES.CASHIER) return '/orders'
  return '/products'
}
