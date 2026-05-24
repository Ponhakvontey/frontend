/**
 * Auth service — calls the real Spring Boot JWT endpoints.
 *
 * Backend endpoints:
 *   POST /api/auth/login    { username, password }   → JwtResponse
 *   POST /api/auth/register { username, email, password, fullName? }  → { message }
 *   POST /api/auth/logout   (requires Bearer token)  → { message }
 */
import { api, saveTokens, saveUser, clearTokens, type AuthUser } from '@/services/apiClient'

// ─── Request / Response shapes (mirror backend DTOs) ────────────────────────

export interface LoginPayload {
  username: string   // backend LoginRequest uses "username" (can be email or username)
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
  token: string
  type: string
  id: number
  username: string
  email: string
  roles: string[]
}

// ─── Auth API calls ─────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<JwtResponse> {
  const data = await api.post<JwtResponse>('/api/auth/login', payload)

  // No refresh token in current backend — store access token only
  saveTokens(data.token, '')
  saveUser({
    id: data.id,
    username: data.username,
    email: data.email,
    roles: data.roles,
  })

  return data
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
  return api.post('/api/auth/register', payload)
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout', {})
  } finally {
    clearTokens()
  }
}

// Re-export session helpers so callers don't need to import apiClient directly
export { isLoggedIn, isAdmin, getUser } from '@/services/apiClient'
