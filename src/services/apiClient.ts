/**
 * Thin fetch wrapper that:
 * 1. Prefixes every request with VITE_API_BASE_URL
 * 2. Injects the stored JWT as Authorization: Bearer <token>
 * 3. Throws on non-2xx responses
 */

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// ─── Token helpers ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'jwtToken'
const REFRESH_KEY = 'refreshToken'
const USER_KEY = 'authUser'

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export interface AuthUser {
  id: number
  username: string
  email: string
  roles: string[]
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function isAdmin(): boolean {
  return getUser()?.roles?.includes('ROLE_ADMIN') ?? false
}

// ─── Core request ───────────────────────────────────────────────────────────

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) {
        // Standard { message: "..." } shape
        message = body.message
      } else if (body?.error) {
        // GlobalExceptionHandler { error: "..." } shape
        message = body.error
      } else if (typeof body === 'object' && body !== null) {
        // Validation errors: { field: "msg", field2: "msg2" }
        const msgs = Object.values(body as Record<string, string>).filter(Boolean)
        if (msgs.length) message = msgs.join(' ')
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  // 204 No Content — return empty
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// Convenience wrappers
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
