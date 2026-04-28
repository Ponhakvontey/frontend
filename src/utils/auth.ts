import { readStorage, writeStorage } from '@/utils/storage'

export interface StoredUser {
  fullName: string
  email: string
  password: string
}

const USERS_KEY = 'users'

export function getStoredUsers() {
  return readStorage<StoredUser[]>(USERS_KEY, [])
}

export function addStoredUser(user: StoredUser) {
  const users = getStoredUsers()
  users.push(user)
  writeStorage(USERS_KEY, users)
}

export function setSession(role: 'admin' | 'user', email: string) {
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userRole', role)
  localStorage.setItem('userEmail', email)
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
