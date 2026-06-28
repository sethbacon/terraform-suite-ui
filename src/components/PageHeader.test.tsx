import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders the title as the page h1', () => {
    render(<PageHeader title="Modules" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Modules')
  })

  it('renders an optional description', () => {
    render(<PageHeader title="T" description="Browse and publish" />)
    expect(screen.getByText('Browse and publish')).toBeInTheDocument()
  })

  it('renders an optional leading icon beside the title', () => {
    render(<PageHeader title="Modules" icon={<svg data-testid="page-icon" />} />)
    expect(screen.getByTestId('page-icon')).toBeInTheDocument()
  })

  it('renders right-aligned actions when provided', () => {
    render(<PageHeader title="T" actions={<button>New</button>} />)
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  })
})
