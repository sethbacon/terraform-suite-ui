import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsentProvider } from './ConsentProvider'
import { ConsentBanner } from './ConsentBanner'

describe('ConsentBanner', () => {
  beforeEach(() => localStorage.clear())

  it('is shown until consent is recorded', () => {
    render(
      <ConsentProvider storageKey="test-consent">
        <ConsentBanner />
      </ConsentProvider>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('hides once a preference is stored', () => {
    localStorage.setItem(
      'test-consent',
      JSON.stringify({ essential: true, errorReporting: false, performanceReporting: false, analytics: false }),
    )
    render(
      <ConsentProvider storageKey="test-consent">
        <ConsentBanner />
      </ConsentProvider>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a custom privacyPolicyHref when it is a safe URL', () => {
    render(
      <ConsentProvider storageKey="test-consent">
        <ConsentBanner privacyPolicyHref="https://example.com/legal/privacy" />
      </ConsentProvider>,
    )
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      'https://example.com/legal/privacy',
    )
  })

  it('falls back to the default href when privacyPolicyHref is an unsafe scheme', () => {
    render(
      <ConsentProvider storageKey="test-consent">
        <ConsentBanner privacyPolicyHref="javascript:alert(1)" />
      </ConsentProvider>,
    )
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
  })
})
