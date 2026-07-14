import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SuiteSwitcher } from './SuiteSwitcher'

const sameOrigin = (path: string) => new URL(path, window.location.origin).href

describe('SuiteSwitcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.name = ''
  })

  it('renders nothing when there are no links', () => {
    const { container } = render(<SuiteSwitcher links={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('reuses one tab for a SAME-origin sibling: claims the tab, opens by name (no noopener), severs opener, focuses', () => {
    const focus = vi.fn()
    const opened = { focus, opener: {} } as unknown as Window
    const open = vi.spyOn(window, 'open').mockReturnValue(opened)
    const href = sameOrigin('/state-manager')
    render(
      <SuiteSwitcher
        links={[{ label: 'State Manager', href, appId: 'terraform-state-manager' }]}
        tooltip="Open State Manager"
        currentAppId="terraform-registry"
      />,
    )
    // A single sibling renders a direct-open button (no menu), labelled by the tooltip.
    fireEvent.click(screen.getByRole('button', { name: 'Open State Manager' }))
    expect(window.name).toBe('terraform-registry')
    // Named target, and crucially NO 'noopener' (which would null the returned reference).
    expect(open).toHaveBeenCalledWith(href, 'terraform-state-manager')
    expect(opened.opener).toBeNull()
    expect(focus).toHaveBeenCalled()
  })

  it('opens a CROSS-origin sibling in a fresh noopener tab and does not reuse or claim the current tab', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    render(
      <SuiteSwitcher
        links={[{ label: 'State Manager', href: 'https://sm.example', appId: 'terraform-state-manager' }]}
        tooltip="Open State Manager"
        currentAppId="terraform-registry"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open State Manager' }))
    expect(window.name).toBe('')
    expect(open).toHaveBeenCalledWith('https://sm.example', '_blank', 'noopener,noreferrer')
  })

  it('opens a menu when given several links (cross-origin siblings use noopener new tabs)', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    render(
      <SuiteSwitcher
        links={[
          { label: 'Registry', href: 'https://reg.example', appId: 'terraform-registry' },
          { label: 'State Manager', href: 'https://sm.example', appId: 'terraform-state-manager' },
        ]}
        currentAppId="other"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Switch app' }))
    fireEvent.click(await screen.findByText('State Manager'))
    expect(open).toHaveBeenCalledWith('https://sm.example', '_blank', 'noopener,noreferrer')
  })

  it('falls back to a plain new tab when a link has no appId', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    render(<SuiteSwitcher links={[{ label: 'Docs', href: 'https://docs.example' }]} tooltip="Open Docs" />)
    fireEvent.click(screen.getByRole('button', { name: 'Open Docs' }))
    expect(open).toHaveBeenCalledWith('https://docs.example', '_blank', 'noopener,noreferrer')
  })

  it('refuses to open a link with an unsafe URL scheme', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    render(
      <SuiteSwitcher
        links={[{ label: 'Evil', href: 'javascript:alert(1)', appId: 'evil' }]}
        tooltip="Open Evil"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open Evil' }))
    expect(open).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unsafe link href'))
  })

  it('in the multi-link menu, refuses an unsafe link (warns, does not open)', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    render(
      <SuiteSwitcher
        links={[
          { label: 'Evil', href: 'javascript:alert(1)', appId: 'evil' },
          { label: 'Docs', href: 'https://docs.example' },
        ]}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Switch app' }))
    fireEvent.click(screen.getByText('Evil'))
    expect(open).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unsafe link href'))
  })
})
