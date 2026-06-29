import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SuiteSwitcher } from './SuiteSwitcher'

describe('SuiteSwitcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.name = ''
  })

  it('renders nothing when there are no links', () => {
    const { container } = render(<SuiteSwitcher links={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('opens a single sibling directly, reusing one tab via appId/currentAppId', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window)
    render(
      <SuiteSwitcher
        links={[{ label: 'State Manager', href: 'https://sm.example', appId: 'terraform-state-manager' }]}
        tooltip="Open State Manager"
        currentAppId="terraform-registry"
      />,
    )
    // A single sibling renders a direct-open button (no menu), labelled by the tooltip.
    fireEvent.click(screen.getByRole('button', { name: 'Open State Manager' }))
    expect(window.name).toBe('terraform-registry')
    expect(open).toHaveBeenCalledWith('https://sm.example', 'terraform-state-manager')
  })

  it('opens a menu when given several links', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window)
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
    expect(open).toHaveBeenCalledWith('https://sm.example', 'terraform-state-manager')
  })

  it('falls back to a plain new tab when a link has no appId', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    render(<SuiteSwitcher links={[{ label: 'Docs', href: 'https://docs.example' }]} tooltip="Open Docs" />)
    fireEvent.click(screen.getByRole('button', { name: 'Open Docs' }))
    expect(open).toHaveBeenCalledWith('https://docs.example')
  })
})
