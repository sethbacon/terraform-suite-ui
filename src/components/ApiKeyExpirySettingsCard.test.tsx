import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiKeyExpirySettingsCard, type ApiKeyExpirySettingsValue } from './ApiKeyExpirySettingsCard'

const baseValue: ApiKeyExpirySettingsValue = {
  enabled: true,
  apiKeyExpiring: true,
  warningDays: 7,
  checkIntervalHours: 24,
}

describe('ApiKeyExpirySettingsCard', () => {
  it('shows a loading indicator', () => {
    render(<ApiKeyExpirySettingsCard value={baseValue} isLoading onSave={() => Promise.resolve()} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders the current settings once loaded', () => {
    render(<ApiKeyExpirySettingsCard value={baseValue} onSave={() => Promise.resolve()} />)
    expect(screen.getByRole('switch')).toBeChecked()
    expect(screen.getByLabelText(/Warn this many days before expiry/)).toHaveValue(7)
    expect(screen.getByLabelText(/Check for expiring keys every/)).toHaveValue(24)
  })

  it('shows a "notifications disabled" badge when the master switch is off', () => {
    render(<ApiKeyExpirySettingsCard value={{ ...baseValue, enabled: false }} onSave={() => Promise.resolve()} />)
    expect(screen.getByText('Notifications disabled')).toBeInTheDocument()
  })

  it('does not show the badge when notifications are enabled', () => {
    render(<ApiKeyExpirySettingsCard value={baseValue} onSave={() => Promise.resolve()} />)
    expect(screen.queryByText('Notifications disabled')).not.toBeInTheDocument()
  })

  it('disables every field when canManage is false', () => {
    render(<ApiKeyExpirySettingsCard value={baseValue} canManage={false} onSave={() => Promise.resolve()} />)
    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.getByLabelText(/Warn this many days before expiry/)).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('calls onSave with the edited values', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ApiKeyExpirySettingsCard value={baseValue} onSave={onSave} />)

    const warningDaysInput = screen.getByLabelText(/Warn this many days before expiry/)
    await user.clear(warningDaysInput)
    await user.type(warningDaysInput, '14')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ apiKeyExpiring: true, warningDays: 14, checkIntervalHours: 24 }),
    )
    expect(await screen.findByText('Settings saved.')).toBeInTheDocument()
  })

  it('toggling the enable switch is reflected in the saved payload', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ApiKeyExpirySettingsCard value={baseValue} onSave={onSave} />)

    await user.click(screen.getByRole('switch'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ apiKeyExpiring: false, warningDays: 7, checkIntervalHours: 24 }),
    )
  })

  it('shows an error message when onSave rejects with an Error', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('nope'))
    const user = userEvent.setup()
    render(<ApiKeyExpirySettingsCard value={baseValue} onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('nope')).toBeInTheDocument()
  })

  it('falls back to a generic error message for a non-Error rejection', async () => {
    const onSave = vi.fn().mockRejectedValue('nope')
    const user = userEvent.setup()
    render(<ApiKeyExpirySettingsCard value={baseValue} onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Failed to save settings.')).toBeInTheDocument()
  })
})
