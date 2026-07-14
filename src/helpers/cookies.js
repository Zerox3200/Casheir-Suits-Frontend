import Cookies from 'universal-cookie'

export const TOKEN_COOKIE_KEY = 'SuitsCashier_token'
export const USER_COOKIE_KEY = 'SuitsCashier_user'

const SEVEN_DAYS_SEC = 7 * 24 * 60 * 60
const ONE_DAY_SEC = 24 * 60 * 60

const cookies = new Cookies(null, { path: '/' })
const authSessionListeners = new Set()
let authSessionVersion = 0

function baseOptions(maxAge) {
    return {
        path: '/',
        sameSite: 'lax',
        secure: import.meta.env.PROD,
        ...(maxAge != null ? { maxAge } : {}),
    }
}

export function subscribeAuthSession(listener) {
    authSessionListeners.add(listener)
    return () => authSessionListeners.delete(listener)
}

export function getAuthSessionVersion() {
    return authSessionVersion
}

function notifyAuthSessionChange() {
    authSessionVersion += 1
    authSessionListeners.forEach((listener) => listener())
}

export function getAuthToken() {
    return cookies.get(TOKEN_COOKIE_KEY) ?? null
}

export function getAuthUser() {
    const raw = cookies.get(USER_COOKIE_KEY)
    if (!raw) return null
    if (typeof raw === 'object') return raw
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function getAuthSessionSnapshot() {
    return {
        token: getAuthToken(),
        user: getAuthUser(),
    }
}



export function setAuthToken(token) {
    cookies.set(TOKEN_COOKIE_KEY, token, baseOptions(SEVEN_DAYS_SEC))
    notifyAuthSessionChange()
}

export function setAuthUser(user) {
    cookies.set(USER_COOKIE_KEY, JSON.stringify(user), baseOptions(SEVEN_DAYS_SEC))
    notifyAuthSessionChange()
}


export function clearAuthCookies() {
    const opts = { path: '/' }
    cookies.remove(TOKEN_COOKIE_KEY, opts)
    cookies.remove(USER_COOKIE_KEY, opts)
    notifyAuthSessionChange()
}

/** Re-export for react-cookie hooks in components */
export { cookies }
