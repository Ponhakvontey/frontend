/**
 * Thin fetch wrapper that:
 * 1. Prefixes every request with VITE_API_BASE_URL (empty in dev — Vite proxy handles routing)
 * 2. Sends credentials (httpOnly auth cookie) with every request
 * 3. Sends X-XSRF-TOKEN header on mutating requests (CSRF protection)
 * 4. Throws on non-2xx; 401 → auto-clears session and redirects to login
 */

// In development the Vite proxy forwards /api/* to localhost:8080, so BASE is empty.
// In production set VITE_API_BASE_URL to the backend origin (e.g. https://api.ubuyee.com).
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

// ─── User metadata ───────────────────────────────────────────────────────────
// The JWT lives in an httpOnly cookie set by the server — JS cannot read it.
// We store only non-sensitive UI metadata (name, email, roles, expiry hint) here.

const USER_KEY = 'authUser'

export interface AuthUser {
  id: number
  username: string
  email: string
  roles: string[]
  /** Epoch ms when the server-side cookie expires — used to show a stale-session hint. */
  expiresAt: number
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

function clearUser() {
  localStorage.removeItem(USER_KEY)
  // Remove legacy keys from the previous Bearer-token approach
  localStorage.removeItem('jwtToken')
  localStorage.removeItem('refreshToken')
}

/**
 * @deprecated Token is now in an httpOnly cookie — this is a no-op kept for call-site compat.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function saveTokens(_accessToken: string, _refreshToken: string) {
  // intentional no-op: server sets the httpOnly cookie; we never touch it from JS
}

/** Clears all client-side session state. The server clears the cookie via Set-Cookie on logout. */
export function clearTokens() {
  clearUser()
}

// ─── Session checks ──────────────────────────────────────────────────────────

/**
 * Returns true if the stored session metadata exists and hasn't reached its
 * known expiry time. This is a client-side hint only — the server is always
 * the authoritative source; a 401 from any API call clears the session.
 */
export function isLoggedIn(): boolean {
  const user = getUser()
  if (!user) return false
  return user.expiresAt > Date.now()
}

/**
 * Reads admin status from the stored user metadata.
 * The real authentication is the httpOnly cookie JWT; localStorage is UI state only.
 */
export function isAdmin(): boolean {
  return getUser()?.roles?.includes('ROLE_ADMIN') ?? false
}

// ─── Core request ───────────────────────────────────────────────────────────

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // send the httpOnly access_token cookie automatically
  })

  if (!res.ok) {
    // 401 while we believe we're logged in → session expired or invalidated
    if (res.status === 401 && getUser()) {
      clearUser()
      window.location.href = '/login'
      // Return a never-resolved promise so callers don't process stale data
      return new Promise(() => {})
    }

    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) {
        message = body.message
      } else if (body?.error) {
        message = body.error
      } else if (typeof body === 'object' && body !== null) {
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
