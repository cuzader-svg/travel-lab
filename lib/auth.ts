export const AUTH_KEY = 'travel-lab.session'
export const SESSION_USER = 'travel-lab.user'

export type SessionUser = {
  name: string
  email: string
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function setSession(user: SessionUser): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  window.localStorage.setItem(SESSION_USER, user.name)
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_KEY)
  window.localStorage.removeItem(SESSION_USER)
}
