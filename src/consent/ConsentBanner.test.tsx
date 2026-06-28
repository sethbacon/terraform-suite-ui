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
})
