import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth, ADMIN_SCOPE } from './AuthProvider'
import type { AuthApi, MeResponse } from './types'

function makeApi(me: MeResponse): AuthApi {
  return {
    getCurrentUser: vi.fn().mockResolvedValue(me),
    login: vi.fn(),
    devLogin: vi.fn().mockResolvedValue(undefined),
    ldapLogin: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    refreshToken: vi.fn().mockResolvedValue({ expires_in: 3600 }),
  }
}

function Probe() {
  const { isAuthenticated, user, hasScope, sessionExpiresSoon, authError, refreshSession, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="name">{user?.name ?? ''}</span>
      <span data-testid="scope">{String(hasScope('state:read'))}</span>
      <span data-testid="scope-mismatch">{String(hasScope('billing:write'))}</span>
      <span data-testid="scope-admin">{String(hasScope(ADMIN_SCOPE))}</span>
      <span data-testid="expires-soon">{String(sessionExpiresSoon)}</span>
      <span data-testid="auth-error">{authError ? 'error' : 'none'}</span>
      <button onClick={() => void refreshSession()}>refresh</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  it('resolves the user and scopes from the injected api', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: ['state:read'],
    })
    render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'))
    expect(screen.getByTestId('name')).toHaveTextContent('Ada')
    expect(screen.getByTestId('scope')).toHaveTextContent('true')
  })

  it('treats the admin scope as a wildcard', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: ['admin'],
    })
    render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('scope')).toHaveTextContent('true'))
    expect(screen.getByTestId('scope-mismatch')).toHaveTextContent('true')
  })

  // Regression guard for the confirmed HIGH audit finding: the only prior tests exercised a
  // MATCHING scope and the admin wildcard — nothing asserted that a non-empty, non-admin,
  // non-matching scope list is correctly DENIED. This is the library's central client-side
  // authorization-adjacent primitive, shared by every consuming app.
  it('denies a scope that is not held and is not the admin wildcard', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: ['state:read'],
    })
    render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'))
    expect(screen.getByTestId('scope-mismatch')).toHaveTextContent('false')
    expect(screen.getByTestId('scope-admin')).toHaveTextContent('false')
  })

  it('is unauthenticated when the api rejects, and exposes the error via authError', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: [],
    })
    api.getCurrentUser = vi.fn().mockRejectedValue(new Error('401'))
    render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'))
    expect(screen.getByTestId('auth-error')).toHaveTextContent('error')
  })

  describe('session-expiry timers', () => {
    afterEach(() => vi.useRealTimers())

    it('flips sessionExpiresSoon once the expiry-lead window is reached', async () => {
      vi.useFakeTimers()
      const api = makeApi({
        user: { id: '1', email: 'a@b.com', name: 'Ada' },
        memberships: [],
        allowed_scopes: ['state:read'],
        // 5 minutes out; SESSION_WARNING_LEAD_MS is 2 minutes, so the warning should fire
        // ~3 minutes from now.
        session_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      render(
        <AuthProvider api={api}>
          <Probe />
        </AuthProvider>,
      )
      // Flush the initial getCurrentUser() microtask (advancing by 0ms under fake timers
      // still lets pending promises resolve) instead of testing-library's waitFor, which
      // polls via setTimeout and would deadlock while fake timers are active.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
      })
      expect(screen.getByTestId('auth')).toHaveTextContent('true')
      expect(screen.getByTestId('expires-soon')).toHaveTextContent('false')

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 1000)
      })
      expect(screen.getByTestId('expires-soon')).toHaveTextContent('true')
    })

    it('clears the pending timer on unmount (no warning fires after unmount)', async () => {
      const api = makeApi({
        user: { id: '1', email: 'a@b.com', name: 'Ada' },
        memberships: [],
        allowed_scopes: ['state:read'],
        session_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      const { unmount } = render(
        <AuthProvider api={api}>
          <Probe />
        </AuthProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'))
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      unmount()
      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })

    it('does not schedule an immediate warning for a session far beyond MAX_TIMEOUT_MS', async () => {
      const api = makeApi({
        user: { id: '1', email: 'a@b.com', name: 'Ada' },
        memberships: [],
        allowed_scopes: ['state:read'],
        // ~60 days out — well past the ~2^31ms (~24.8 day) setTimeout ceiling.
        session_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      })
      render(
        <AuthProvider api={api}>
          <Probe />
        </AuthProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'))
      expect(screen.getByTestId('expires-soon')).toHaveTextContent('false')

      vi.useFakeTimers()
      // Advancing well short of the re-arm ceiling must not fire a spurious warning.
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000)
      })
      expect(screen.getByTestId('expires-soon')).toHaveTextContent('false')
    })
  })

  it('refreshSession logs out when the host refreshToken() rejects', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: ['state:read'],
    })
    api.refreshToken = vi.fn().mockRejectedValue(new Error('refresh failed'))
    render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'))
    await act(async () => screen.getByText('refresh').click())
    expect(api.logout).toHaveBeenCalled()
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'))
  })

  it('logout() does not throw when the host api.logout() throws', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: ['state:read'],
    })
    api.logout = vi.fn().mockImplementation(() => {
      throw new Error('boom')
    })
    render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'))
    expect(() => act(() => screen.getByText('logout').click())).not.toThrow()
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'))
  })

  it('propagates a devLogin() rejection without leaving stale authenticated state', async () => {
    function DevLoginProbe() {
      const { devLogin, isAuthenticated } = useAuth()
      return (
        <div>
          <span data-testid="auth">{String(isAuthenticated)}</span>
          <button onClick={() => devLogin().catch(() => undefined)}>dev-login</button>
        </div>
      )
    }
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: [],
    })
    api.getCurrentUser = vi.fn().mockRejectedValue(new Error('401'))
    api.devLogin = vi.fn().mockRejectedValue(new Error('bad credentials'))
    render(
      <AuthProvider api={api}>
        <DevLoginProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'))
    await act(async () => screen.getByText('dev-login').click())
    // devLogin() rejected before loadUser() ran again — still unauthenticated, no partial state.
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })
})

