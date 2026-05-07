import { readStorage, writeStorage } from '@/utils/storage'

export interface StoredUser {
  id: string
  fullName: string
  email: string
  password: string
  role: 'admin' | 'customer'
  joinDate: string
  hasLoggedIn: boolean
  lastLoginAt: string | null
}

const USERS_KEY = 'users'
const BLOCKED_USERS_KEY = 'blockedUsers'
const RESET_EMAIL_KEY = 'resetEmail'

export function getStoredUsers() {
  return readStorage<StoredUser[]>(USERS_KEY, [])
}

export function addStoredUser(user: {
  fullName: string
  email: string
  password: string
  role?: 'admin' | 'customer'
}) {
  const users = getStoredUsers()

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    fullName: user.fullName,
    email: user.email.toLowerCase(),
    password: user.password,
    role: user.role ?? 'customer',
    joinDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    hasLoggedIn: false,
    lastLoginAt: null,
  }

  users.push(newUser)
  writeStorage(USERS_KEY, users)
}

export function markUserLoggedIn(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getStoredUsers()

  const updatedUsers = users.map((user) => {
    if (user.email.toLowerCase() !== normalizedEmail) return user

    return {
      ...user,
      hasLoggedIn: true,
      lastLoginAt: new Date().toISOString(),
    }
  })

  writeStorage(USERS_KEY, updatedUsers)
}

export function setSession(role: 'admin' | 'customer', email: string) {
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userRole', role)
  localStorage.setItem('userEmail', email.trim().toLowerCase())
}

export function clearSession() {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userEmail')
}

export function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true'
}

export function isAdmin() {
  return localStorage.getItem('userRole') === 'admin'
}

export function getBlockedUsers() {
  return readStorage<string[]>(BLOCKED_USERS_KEY, [])
}

export function isUserBlocked(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  return getBlockedUsers().includes(normalizedEmail)
}

export function setResetEmail(email: string) {
  localStorage.setItem(RESET_EMAIL_KEY, email.trim().toLowerCase())
}

export function getResetEmail() {
  return localStorage.getItem(RESET_EMAIL_KEY) || ''
}

export function clearResetEmail() {
  localStorage.removeItem(RESET_EMAIL_KEY)
}

export function updateStoredUserPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getStoredUsers()
  let updated = false

  const updatedUsers = users.map((user) => {
    if (user.email.toLowerCase() !== normalizedEmail) return user
    updated = true
    return {
      ...user,
      password,
    }
  })

  if (updated) {
    writeStorage(USERS_KEY, updatedUsers)
  }

  return updated
}
