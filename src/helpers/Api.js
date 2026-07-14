import axios from "axios";
import { clearAuthCookies, getAuthToken } from "./cookies";

const AUTH_PATH_PATTERN = /^\/auth(\/|$)/i;

export const createIdempotencyKey = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const resolveRequestPath = (url = "") => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) {
        try {
            return new URL(url).pathname;
        } catch {
            return url.split("?")[0];
        }
    }
    return url.split("?")[0];
};

const isAuthRequest = (url = "") => AUTH_PATH_PATTERN.test(resolveRequestPath(url));

export const BaseUrl =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5200";

const api = axios.create({
    baseURL: BaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(
    (config) => {
        const token = getAuthToken()
        if (token) {
            // Velora API: `token` header (primary) or Bearer
            config.headers.token = token
            config.headers.Authorization = `Bearer ${token}`
        }

        if (typeof FormData !== "undefined" && config.data instanceof FormData) {
            config.headers = config.headers ?? {}
            delete config.headers["Content-Type"]
        }

        const method = String(config.method || "get").toLowerCase()
        const url = config.url || ""
        if (method === "post" && !isAuthRequest(url)) {
            config.headers = config.headers ?? {}
            if (!config.headers["Idempotency-Key"]) {
                config.headers["Idempotency-Key"] = createIdempotencyKey()
            }
        }

        return config
    },
    (error) => Promise.reject(error)
)


const goToLoginOnce = () => {
    const path = window.location.pathname
    const isAuthPage = path === '/auth' || path.startsWith('/auth/')
    if (!isAuthPage) {
        window.location.href = '/auth'
    }
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status

        const isNetworkError =
            error.code === 'ERR_NETWORK' ||
            error.message === 'Network Error' ||
            error.message?.includes('ERR_EMPTY_RESPONSE') ||
            (!error.response && error.request)

        // Check if it's a business logic error (not authentication error)
        const errorMessage = error.response?.data?.message || error.response?.data?.error || ''
        const isBusinessLogicError =
            errorMessage.includes('Profile limit reached') ||
            errorMessage.includes('profile limit') ||
            errorMessage.includes('maximum') ||
            errorMessage.includes('limit')

        const isPermissionDenied =
            status === 403 &&
            (errorMessage.toLowerCase().includes('permission') ||
                errorMessage.toLowerCase().includes('not allowed') ||
                errorMessage.toLowerCase().includes('cannot be frozen') ||
                errorMessage.toLowerCase().includes('admin accounts'))

        const isFrozenSession =
            status === 403 && errorMessage.toLowerCase().includes('frozen')

        // 401 is always an auth error. Frozen accounts stay signed in and see the portal lock screen.
        const isAuthError = status === 401

        const isVerifyEndpoint = error.config?.url?.includes('/auth/verify')

        // The verify endpoint is the canary for the user's session. If it fails for
        // ANY reason (network, 404 missing route, 5xx server crash, 401/403 expired
        // token) we cannot trust the session — clear it and send the user back to
        // login instead of leaving the dashboard stuck retrying forever.
        if (isVerifyEndpoint) {
            clearAuthCookies()
            // Let the caller (verifyUserRole) decide where to navigate. We don't
            // hard-redirect here so that public pages calling verify don't bounce.
            return Promise.reject(error)
        }

        if (isAuthError) {
            clearAuthCookies()
            goToLoginOnce()
        }

        return Promise.reject(error)
    }
)

export default api

