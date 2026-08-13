export const TOKEN_COOKIE_KEY = 'SuitsCashier_token'
export const USER_COOKIE_KEY = 'SuitsCashier_user'

const SEVEN_DAYS_SEC = 7 * 24 * 60 * 60

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name, value, maxAgeSec) {
  if (typeof document === 'undefined') return
  // Only mark Secure on HTTPS — otherwise cookies never save (HTTP preview / some hosts)
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax${secure}`
}

function removeCookie(name) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export function getAuthToken() {
  return getCookie(TOKEN_COOKIE_KEY)
}

export function getAuthUser() {
  const raw = getCookie(USER_COOKIE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  setCookie(TOKEN_COOKIE_KEY, token, SEVEN_DAYS_SEC)
}

export function setAuthUser(user) {
  setCookie(USER_COOKIE_KEY, JSON.stringify(user), SEVEN_DAYS_SEC)
}

export function clearAuthCookies() {
  removeCookie(TOKEN_COOKIE_KEY)
  removeCookie(USER_COOKIE_KEY)
}
