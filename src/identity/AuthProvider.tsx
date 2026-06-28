import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AuthApi, AuthContextType, MeResponse, RoleTemplateInfo, User } from './types'

/** How long before session expiry the warning appears. */
export const SESSION_WARNING_LEAD_MS = 2 * 60 * 1000

// setTimeout delays beyond 2^31-1 ms overflow and fire immediately; skip
// scheduling for sessions that long (the warning is pointless weeks out anyway).
const MAX_TIMEOUT_MS = 2 ** 31 - 1

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

// hasScope mirrors the backend's check: the "admin" wildcard grants everything.
function scopeSatisfied(scopes: string[], scope: string): boolean {
  return scopes.includes('admin') || scopes.includes(scope)
}

export interface AuthProviderProps {
  children: ReactNode
  /** App-specific backend contract that drives authentication. */
  api: AuthApi
  /** Clears any app-specific cached auth storage during logout. */
  onClearStorage?: () => void
}

/**
 * Holds the authenticated session, derived from the backend via the injected
 * {@link AuthApi}. Exposes the canonical auth surface shared by both suite apps
 * and schedules a session-expiry warning. The `api`/`onClearStorage` props are
 * read through refs, so passing a fresh object each render is harmless.
 */
export function AuthProvider({ children, api, onClearStorage }: AuthProviderProps) {
  const apiRef = useRef(api)
  apiRef.current = api
  const onClearStorageRef = useRef(onClearStorage)
  onClearStorageRef.current = onClearStorage

  const [user, setUser] = useState<User | null>(null)
  const [roleTemplate, setRoleTemplate] = useState<RoleTemplateInfo | null>(null)
  const [allowedScopes, setAllowedScopes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null)
  const [sessionExpiresSoon, setSessionExpiresSoon] = useState(false)
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSessionWarning = useCallback((expiresAt: Date) => {
    if (warnTimer.current) clearTimeout(warnTimer.current)
    setSessionExpiresAt(expiresAt)
    setSessionExpiresSoon(false)
    const delay = expiresAt.getTime() - Date.now() - SESSION_WARNING_LEAD_MS
    if (delay > MAX_TIMEOUT_MS) return
    if (delay <= 0) {
      setSessionExpiresSoon(true)
      return
    }
    warnTimer.current = setTimeout(() => setSessionExpiresSoon(true), delay)
  }, [])

  useEffect(
    () => () => {
      if (warnTimer.current) clearTimeout(warnTimer.current)
    },
    [],
  )

  const applyMe = useCallback(
    (me: MeResponse) => {
      setUser(me.user)
      setAllowedScopes(me.allowed_scopes ?? [])
      const primary = me.memberships?.find((m) => m.role_template_name)
      setRoleTemplate(
        primary?.role_template_name
          ? {
            name: primary.role_template_name,
            display_name: primary.role_template_name,
            scopes: primary.role_template_scopes,
          }
          : null,
      )
      if (me.session_expires_at) scheduleSessionWarning(new Date(me.session_expires_at))
    },
    [scheduleSessionWarning],
  )

  const loadUser = useCallback(async () => {
    try {
      applyMe(await apiRef.current.getCurrentUser())
    } catch {
      setUser(null)
      setRoleTemplate(null)
      setAllowedScopes([])
      setSessionExpiresAt(null)
    }
  }, [applyMe])

  // On mount, resolve the session from the backend.
  useEffect(() => {
    loadUser().finally(() => setIsLoading(false))
  }, [loadUser])

  const login = useCallback((provider = 'oidc') => {
    apiRef.current.login(provider)
  }, [])

  const devLogin = useCallback(async () => {
    await apiRef.current.devLogin()
    await loadUser()
  }, [loadUser])

  const ldapLogin = useCallback(
    async (username: string, password: string) => {
      await apiRef.current.ldapLogin(username, password)
      await loadUser()
    },
    [loadUser],
  )

  const logout = useCallback(() => {
    if (warnTimer.current) clearTimeout(warnTimer.current)
    setSessionExpiresSoon(false)
    setSessionExpiresAt(null)
    setUser(null)
    setRoleTemplate(null)
    setAllowedScopes([])
    onClearStorageRef.current?.()
    apiRef.current.logout()
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const { expires_in } = await apiRef.current.refreshToken()
      scheduleSessionWarning(new Date(Date.now() + expires_in * 1000))
    } catch {
      logout()
    }
  }, [scheduleSessionWarning, logout])

  const hasScope = useCallback(
    (scope: string) => scopeSatisfied(allowedScopes, scope),
    [allowedScopes],
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      roleTemplate,
      allowedScopes,
      isAuthenticated: user !== null,
      isLoading,
      sessionExpiresAt,
      sessionExpiresSoon,
      login,
      devLogin,
      ldapLogin,
      logout,
      refreshSession,
      hasScope,
    }),
    [
      user,
      roleTemplate,
      allowedScopes,
      isLoading,
      sessionExpiresAt,
      sessionExpiresSoon,
      login,
      devLogin,
      ldapLogin,
      logout,
      refreshSession,
      hasScope,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
