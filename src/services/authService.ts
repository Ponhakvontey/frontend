/**
 * Auth service — calls the Spring Boot JWT endpoints.
 * The JWT is stored in an httpOnly cookie set by the server;
 * we only keep non-sensitive user metadata in localStorage.
 *
 * Backend endpoints:
 *   POST /api/auth/login    { username, password }  → JwtResponse (token in cookie)
 *   POST /api/auth/register { username, email, password, fullName? } → { message }
 *   POST /api/auth/logout   (cookie sent automatically) → { message }
 */
import { api, saveUser, clearTokens, type AuthUser } from '@/services/apiClient'
import { signInWithGoogle as firebaseSignInWithGoogle } from '@/utils/firebase'

// ─── Request / Response shapes (mirror backend DTOs) ────────────────────────

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  fullName?: string
  phone?: string
}

interface JwtResponse {
  token: string | null  // null — token is in the httpOnly cookie
  type: string
  id: number
  username: string
  email: string
  roles: string[]
  expiresAt: number     // epoch ms — when the cookie expires
}

// ─── Auth API calls ─────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<JwtResponse> {
  const data = await api.post<JwtResponse>('/api/auth/login', payload)

  // Server sets the httpOnly access_token cookie; we store only UI metadata
  saveUser({
    id: data.id,
    username: data.username,
    email: data.email,
    roles: data.roles,
    expiresAt: data.expiresAt,
  })

  return data
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
  return api.post('/api/auth/register', payload)
}

export async function loginWithGoogle(): Promise<JwtResponse> {
  const idToken = await firebaseSignInWithGoogle()
  const data = await api.post<JwtResponse>('/api/auth/google', { idToken })

  saveUser({
    id: data.id,
    username: data.username,
    email: data.email,
    roles: data.roles,
    expiresAt: data.expiresAt,
  })

  return data
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/api/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/api/auth/reset-password', { token, newPassword })
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout', {})
  } finally {
    clearTokens() // clears localStorage; server clears the cookie via Set-Cookie
  }
}

// Re-export session helpers so callers don't need to import apiClient directly
export { isLoggedIn, isAdmin, getUser } from '@/services/apiClient'
