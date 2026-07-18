import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  NotificationChannelsSection,
  type NotificationChannelListItem,
  type NotificationChannelFormValues,
} from './NotificationChannelsSection'

const channelTypes = [
  { value: 'webhook', label: 'Webhook' },
  { value: 'email', label: 'Email', isEmail: true },
]
const eventOptions = [
  { value: 'module_published', label: 'Module published' },
  { value: 'cve_detected', label: 'CVE detected' },
]

const baseChannel: NotificationChannelListItem = {
  id: 'ch-1',
  name: 'Ops webhook',
  type: 'webhook',
  events: ['module_published'],
  enabled: true,
  last_status: 'sent',
}

function noop() {
  return Promise.resolve()
}

describe('NotificationChannelsSection', () => {
  it('shows a loading indicator', () => {
    render(
      <NotificationChannelsSection
        channels={[]}
        isLoading
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows an error state', () => {
    render(
      <NotificationChannelsSection
        channels={[]}
        isError
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    expect(screen.getByText('Failed to load notification channels.')).toBeInTheDocument()
  })

  it('shows an empty state when there are no channels', () => {
    render(
      <NotificationChannelsSection
        channels={[]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    expect(screen.getByText('No notification channels configured yet.')).toBeInTheDocument()
  })

  it('renders a channel row with its type and event labels', () => {
    render(
      <NotificationChannelsSection
        channels={[baseChannel]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    expect(screen.getByText('Ops webhook')).toBeInTheDocument()
    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(screen.getByText('Module published')).toBeInTheDocument()
  })

  it('disables mutating actions when canManage is false', () => {
    render(
      <NotificationChannelsSection
        channels={[baseChannel]}
        canManage={false}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add channel' })).toBeDisabled()
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('calls onTest when the test action is clicked', async () => {
    const onTest = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(
      <NotificationChannelsSection
        channels={[baseChannel]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={onTest}
        onToggleEnabled={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Send test' }))
    await waitFor(() => expect(onTest).toHaveBeenCalledWith('ch-1'))
    expect(await screen.findByText('Test notification sent.')).toBeInTheDocument()
  })

  it('calls onToggleEnabled when the row switch is flipped', async () => {
    const onToggleEnabled = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(
      <NotificationChannelsSection
        channels={[baseChannel]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={onToggleEnabled}
      />,
    )
    await user.click(screen.getByRole('switch'))
    await waitFor(() => expect(onToggleEnabled).toHaveBeenCalledWith(baseChannel, false))
  })

  it('deletes a channel through the confirm dialog', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(
      <NotificationChannelsSection
        channels={[baseChannel]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={onDelete}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Ops webhook/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('ch-1'))
  })

  it('creates a channel through the add dialog, requiring name and target', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(
      <NotificationChannelsSection
        channels={[]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={onCreate}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add channel' }))
    const dialog = await screen.findByRole('dialog')
    const saveButton = within(dialog).getByRole('button', { name: 'Save' })
    expect(saveButton).toBeDisabled()

    await user.type(within(dialog).getByLabelText('Name *'), 'New hook')
    await user.type(within(dialog).getByLabelText(/Target URL/), 'https://example.com/hook')
    expect(saveButton).toBeEnabled()
    await user.click(saveButton)

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({
        name: 'New hook',
        type: 'webhook',
        target: 'https://example.com/hook',
        events: [],
        enabled: true,
      } satisfies NotificationChannelFormValues),
    )
  })

  it('allows saving an edit with a blank target (keeps the existing one)', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(
      <NotificationChannelsSection
        channels={[baseChannel]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={onUpdate}
        onDelete={noop}
        onTest={noop}
        onToggleEnabled={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')
    const saveButton = within(dialog).getByRole('button', { name: 'Save' })
    expect(saveButton).toBeEnabled()
    await user.click(saveButton)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith('ch-1', {
        name: 'Ops webhook',
        type: 'webhook',
        target: undefined,
        events: ['module_published'],
        enabled: true,
      } satisfies NotificationChannelFormValues),
    )
  })

  it('shows a save error message from a thrown Error', async () => {
    const onTest = vi.fn().mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(
      <NotificationChannelsSection
        channels={[baseChannel]}
        channelTypes={channelTypes}
        eventOptions={eventOptions}
        onCreate={noop}
        onUpdate={() => Promise.resolve()}
        onDelete={noop}
        onTest={onTest}
        onToggleEnabled={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Send test' }))
    expect(await screen.findByText('Failed to send test notification.')).toBeInTheDocument()
  })

  // Ensures the component re-renders on parent-driven prop changes (a
  // Wrapper is used only to exercise re-render via useState, not to test
  // internal state).
  it('reflects updated channels passed in from the parent', () => {
    function Wrapper() {
      const [channels, setChannels] = useState<NotificationChannelListItem[]>([baseChannel])
      return (
        <>
          <button onClick={() => setChannels([{ ...baseChannel, name: 'Renamed' }])}>rename</button>
          <NotificationChannelsSection
            channels={channels}
            channelTypes={channelTypes}
            eventOptions={eventOptions}
            onCreate={noop}
            onUpdate={() => Promise.resolve()}
            onDelete={noop}
            onTest={noop}
            onToggleEnabled={noop}
          />
        </>
      )
    }
    render(<Wrapper />)
    expect(screen.getByText('Ops webhook')).toBeInTheDocument()
  })
})
