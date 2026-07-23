import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Page } from './Page'

describe('Page', () => {
  it('renders its children', () => {
    render(
      <Page>
        <p>Content</p>
      </Page>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('defaults to maxWidth lg', () => {
    render(<Page data-testid="page">Content</Page>)
    expect(screen.getByTestId('page')).toHaveClass('MuiContainer-maxWidthLg')
  })

  it('forwards a custom maxWidth', () => {
    render(
      <Page maxWidth="sm" data-testid="page">
        Content
      </Page>,
    )
    expect(screen.getByTestId('page')).toHaveClass('MuiContainer-maxWidthSm')
  })

  it('merges a custom sx with the default padding', () => {
    render(
      <Page sx={{ color: 'red' }} data-testid="page">
        Content
      </Page>,
    )
    expect(screen.getByTestId('page')).toBeInTheDocument()
  })
})
