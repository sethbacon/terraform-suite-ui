import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthProvider'
import { SessionExpiryWarning } from './SessionExpiryWarning'
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

function AuthReadySignal() {
  const { isAuthenticated } = useAuth()
  return <span data-testid="auth-ready">{String(isAuthenticated)}</span>
}

describe('SessionExpiryWarning', () => {
  afterEach(() => vi.useRealTimers())

  it('renders nothing before the session enters the expiry-warning window', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: [],
      session_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
    render(
      <AuthProvider api={api}>
        <AuthReadySignal />
        <SessionExpiryWarning />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth-ready')).toHaveTextContent('true'))
    expect(screen.queryByTestId('session-expiry-warning')).not.toBeInTheDocument()
  })

  it('shows the warning and wires the refresh button to refreshSession', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: [],
      // Already within the SESSION_WARNING_LEAD_MS window, so it renders as soon as the
      // initial session resolves — no timer needs to fire for this test.
      session_expires_at: new Date(Date.now() + 1000).toISOString(),
    })
    render(
      <AuthProvider api={api}>
        <SessionExpiryWarning />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('session-expiry-warning')).toBeInTheDocument())

    await act(async () => {
      screen.getByText('Refresh session').click()
    })
    expect(api.refreshToken).toHaveBeenCalled()
  })

  it('wires the sign-out button to logout', async () => {
    const api = makeApi({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: [],
      session_expires_at: new Date(Date.now() + 1000).toISOString(),
    })
    render(
      <AuthProvider api={api}>
        <SessionExpiryWarning />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('session-expiry-warning')).toBeInTheDocument())

    act(() => screen.getByText('Sign out').click())
    expect(api.logout).toHaveBeenCalled()
  })
})
