import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthProvider'
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
  const { isAuthenticated, user, hasScope } = useAuth()
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="name">{user?.name ?? ''}</span>
      <span data-testid="scope">{String(hasScope('state:read'))}</span>
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
  })

  it('is unauthenticated when the api rejects', async () => {
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
  })
})
