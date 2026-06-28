import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import StorageIcon from '@mui/icons-material/Storage'
import { SuiteLayout } from './SuiteLayout'
import { SuiteThemeProvider } from '../theme'
import { AuthProvider, type AuthApi } from '../identity'

const api: AuthApi = {
  getCurrentUser: vi.fn().mockResolvedValue({
    user: { id: '1', email: 'a@b.com', name: 'Ada' },
    memberships: [],
    allowed_scopes: ['admin'],
  }),
  login: vi.fn(),
  devLogin: vi.fn().mockResolvedValue(undefined),
  ldapLogin: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn(),
  refreshToken: vi.fn().mockResolvedValue({ expires_in: 3600 }),
}

const homeItem = { path: '/', labelKey: 'Home', icon: <StorageIcon />, scope: null }

describe('SuiteLayout', () => {
  it('renders the brand product name and the routed content', async () => {
    render(
      <SuiteThemeProvider defaultProductName="Test Suite">
        <AuthProvider api={api}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route element={<SuiteLayout homeItem={homeItem} />}>
                <Route path="/" element={<div>routed content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </SuiteThemeProvider>,
    )
    expect(await screen.findByText('Test Suite')).toBeInTheDocument()
    expect(screen.getByText('routed content')).toBeInTheDocument()
  })
})
