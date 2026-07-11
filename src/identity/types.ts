export interface User {
  id: string
  email: string
  name: string
}

export interface Membership {
  organization_id: string
  organization_name: string
  role_template_name?: string | null
  role_template_scopes?: string[]
}

export interface MeResponse {
  user: User
  memberships: Membership[]
  allowed_scopes: string[]
  session_expires_at?: string
}

/**
 * Primary role template summary, informational/display-only (e.g. "show the user's role name
 * in a profile menu"). It is derived from the FIRST membership that carries a role template,
 * so its `scopes` field is NOT necessarily the user's full effective scope set and must never
 * be used for gating. Use {@link AuthContextType.hasScope} / `allowedScopes` for that — they
 * are the sole authorization-adjacent surface this library exposes.
 */
export interface RoleTemplateInfo {
  id?: string
  name: string
  display_name: string
  scopes?: string[]
}

export interface AuthContextType {
  user: User | null
  /** Display-only — do NOT use for authorization gating. See {@link RoleTemplateInfo}. */
  roleTemplate: RoleTemplateInfo | null
  allowedScopes: string[]
  isAuthenticated: boolean
  isLoading: boolean
  /** Absolute session expiry, or null when unknown. */
  sessionExpiresAt: Date | null
  /** True once the session is within the expiry-warning window. */
  sessionExpiresSoon: boolean
  /**
   * The error from the most recent failed `getCurrentUser()`/session-resolution call, or null.
   * Lets a host distinguish a real "not logged in" state from a transient network/backend
   * error if it wants to (e.g. show a retry banner instead of redirecting to login) —
   * `isAuthenticated` is always false in both cases, since the library fails closed regardless.
   */
  authError: unknown
  login: (provider?: string) => void
  devLogin: () => Promise<void>
  ldapLogin: (username: string, password: string) => Promise<void>
  logout: () => void
  /** Rotate the session before it lapses; logs out on failure. */
  refreshSession: () => Promise<void>
  /**
   * UI-visibility gate ONLY — NOT an authorization boundary. Every consuming app's backend
   * must independently enforce authorization on every request; this check exists purely to
   * hide/show nav items and UI affordances the user is not expected to use.
   */
  hasScope: (scope: string) => boolean
}

/**
 * The backend contract the AuthProvider drives. Each app supplies its own
 * implementation (cookie-based, bearer-token, etc.) — the provider only cares
 * about this surface.
 */
export interface AuthApi {
  getCurrentUser: () => Promise<MeResponse>
  /** Redirect the browser to begin an SSO login for the given provider. */
  login: (provider: string) => void
  /** Establish a dev session (sets the session cookie/token), then resolve via /me. */
  devLogin: () => Promise<unknown>
  /** Establish an LDAP session, then resolve via /me. */
  ldapLogin: (username: string, password: string) => Promise<unknown>
  logout: () => void
  /** Rotate the session; returns the new TTL in seconds. */
  refreshToken: () => Promise<{ expires_in: number }>
}
