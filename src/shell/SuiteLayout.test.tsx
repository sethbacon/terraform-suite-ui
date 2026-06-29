import { describe, expect, it, vi } from 'vitest'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import StorageIcon from '@mui/icons-material/Storage'
import { SuiteLayout, type SuiteLayoutProps } from './SuiteLayout'
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

function renderLayout(props: Partial<SuiteLayoutProps> = {}) {
  return render(
    <SuiteThemeProvider defaultProductName="Test Suite">
      <AuthProvider api={api}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<SuiteLayout homeItem={homeItem} {...props} />}>
              <Route path="/" element={<div>routed content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </SuiteThemeProvider>,
  )
}

describe('SuiteLayout', () => {
  it('renders the brand product name and the routed content', async () => {
    renderLayout()
    expect(await screen.findByText('Test Suite')).toBeInTheDocument()
    expect(screen.getByText('routed content')).toBeInTheDocument()
  })

  it('shows separate theme and language controls by default', async () => {
    renderLayout({ languages: [{ code: 'en', label: 'English' }] })
    expect(await screen.findByRole('button', { name: 'Toggle theme' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument()
  })

  it('combines theme and language into a single Settings menu when settingsMenu is set', async () => {
    renderLayout({
      settingsMenu: true,
      languages: [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
      ],
    })
    const settingsButton = await screen.findByRole('button', { name: 'Settings' })
    expect(screen.queryByRole('button', { name: 'Toggle theme' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Language' })).not.toBeInTheDocument()

    fireEvent.click(settingsButton)
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText(/mode$/i)).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: 'English' })).toBeInTheDocument()

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Español' }))
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('toggles the theme from the Settings menu and closes it', async () => {
    renderLayout({ settingsMenu: true })
    fireEvent.click(await screen.findByRole('button', { name: 'Settings' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /mode$/i }))
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('renders the supportMenu slot', async () => {
    renderLayout({ supportMenu: <button>support-slot</button> })
    expect(await screen.findByRole('button', { name: 'support-slot' })).toBeInTheDocument()
  })
})
