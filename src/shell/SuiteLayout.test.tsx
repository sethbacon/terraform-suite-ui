import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lazy, type ReactNode } from 'react'
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
import type { NavGroup } from './types'

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

function makeApi(scopes: string[] = ['admin']): AuthApi {
  return {
    ...api,
    getCurrentUser: vi.fn().mockResolvedValue({
      user: { id: '1', email: 'a@b.com', name: 'Ada' },
      memberships: [],
      allowed_scopes: scopes,
    }),
  }
}

function renderLayout(
  props: Partial<SuiteLayoutProps> = {},
  opts: { authApi?: AuthApi; child?: ReactNode } = {},
) {
  const { authApi = api, child = <div>routed content</div> } = opts
  return render(
    <SuiteThemeProvider defaultProductName="Test Suite">
      <AuthProvider api={authApi}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<SuiteLayout homeItem={homeItem} {...props} />}>
              <Route path="/" element={child} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </SuiteThemeProvider>,
  )
}

const adminGroup: NavGroup = {
  key: 'admin',
  labelKey: 'Administration',
  standaloneItem: { path: '/admin', labelKey: 'Dashboard', icon: <StorageIcon />, scope: null },
  items: [{ path: '/admin/users', labelKey: 'Users', icon: <StorageIcon />, scope: 'admin' }],
}

beforeEach(() => {
  localStorage.clear()
})

describe('SuiteLayout', () => {
  it('renders the brand product name and the routed content', async () => {
    renderLayout()
    expect(await screen.findByText('Test Suite')).toBeInTheDocument()
    expect(screen.getByText('routed content')).toBeInTheDocument()
  })

  it('shows the user name and email in the account menu', async () => {
    renderLayout()
    fireEvent.click(await screen.findByRole('button', { name: 'Account' }))
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('a@b.com')).toBeInTheDocument()
  })

  it('renders the whitelabel logo as the brand when the theme provides one', async () => {
    render(
      <SuiteThemeProvider
        defaultProductName="Test Suite"
        getUITheme={() => ({ logo_url: 'https://example.test/logo.png', product_name: 'Test Suite' })}
      >
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
    const logo = await screen.findByRole('img', { name: 'Test Suite' })
    expect(logo).toHaveAttribute('src', 'https://example.test/logo.png')
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

  it('renders the contentHeader above the routed content', async () => {
    renderLayout({ contentHeader: <div>breadcrumbs-slot</div> })
    expect(await screen.findByText('breadcrumbs-slot')).toBeInTheDocument()
    expect(screen.getByText('routed content')).toBeInTheDocument()
  })

  it('renders a group standaloneItem when the group is visible', async () => {
    renderLayout({ navGroups: [adminGroup] }, { authApi: makeApi(['admin']) })
    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Administration')).toBeInTheDocument()
  })

  it('hides the standaloneItem when the group is scope-filtered out', async () => {
    renderLayout({ navGroups: [adminGroup] }, { authApi: makeApi([]) })
    await screen.findByText('Test Suite')
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument(),
    )
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
  })

  it('persists group open-state to localStorage when groupStateStorageKey is set', async () => {
    renderLayout(
      { navGroups: [adminGroup], groupStateStorageKey: 'test-groups' },
      { authApi: makeApi(['admin']) },
    )
    expect(await screen.findByRole('link', { name: 'Users' })).toBeInTheDocument()
    fireEvent.click(screen.getByText('Administration'))
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('test-groups') ?? '{}').admin).toBe(false),
    )
  })

  it('restores collapsed group state from localStorage', async () => {
    localStorage.setItem('test-groups', JSON.stringify({ admin: false }))
    renderLayout(
      { navGroups: [adminGroup], groupStateStorageKey: 'test-groups' },
      { authApi: makeApi(['admin']) },
    )
    expect(await screen.findByText('Administration')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument()
  })

  it('shows a loading fallback while a lazy page resolves', async () => {
    const Lazy = lazy(() => Promise.resolve({ default: () => <div>lazy-loaded</div> }))
    renderLayout({}, { child: <Lazy /> })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(await screen.findByText('lazy-loaded')).toBeInTheDocument()
  })
})
