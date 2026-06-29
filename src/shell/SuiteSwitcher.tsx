import { useState } from 'react'
import { IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps'
import type { SuiteLink } from './types'

export interface SuiteSwitcherProps {
  links: SuiteLink[]
  /** Tooltip / aria-label for the trigger (default 'Switch app'). */
  tooltip?: string
  /**
   * This app's stable window name. When set (with a link's appId), the switcher
   * claims it on the current tab before opening a sibling, so the sibling can
   * reuse one tab instead of spawning new ones.
   */
  currentAppId?: string
}

/**
 * Opens a sibling suite app. When the link carries an appId, the current tab
 * first claims currentAppId, then the sibling opens under the stable window name
 * appId so repeat clicks re-navigate (and refocus) the same tab. Siblings are
 * trusted first-party apps, so noopener/noreferrer are intentionally omitted
 * (they would force a fresh browsing context and defeat the tab reuse).
 */
function openSuiteLink(link: SuiteLink, currentAppId?: string): void {
  if (link.appId) {
    if (currentAppId) window.name = currentAppId
    window.open(link.href, link.appId)?.focus()
  } else {
    window.open(link.href)
  }
}

/**
 * AppBar control that switches between the suite's apps. A single link renders a
 * direct-open button (the common two-app suite case); several render a menu.
 * Links carrying an appId reuse one tab per sibling (see openSuiteLink).
 */
export function SuiteSwitcher({ links, tooltip = 'Switch app', currentAppId }: SuiteSwitcherProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  if (links.length === 0) return null

  if (links.length === 1) {
    const link = links[0]
    return (
      <Tooltip title={tooltip}>
        <IconButton
          color="inherit"
          edge="start"
          aria-label={tooltip}
          sx={{ mr: 1 }}
          onClick={() => openSuiteLink(link, currentAppId)}
        >
          <AppsIcon />
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={tooltip}
        >
          <AppsIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {links.map((link) => (
          <MenuItem
            key={link.href}
            selected={link.current}
            onClick={() => {
              setAnchor(null)
              openSuiteLink(link, currentAppId)
            }}
          >
            <ListItemText primary={link.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
