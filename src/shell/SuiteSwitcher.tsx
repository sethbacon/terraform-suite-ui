import { useState } from 'react'
import { IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps'
import type { SuiteLink } from './types'

export interface SuiteSwitcherProps {
  links: SuiteLink[]
  /** Tooltip / aria-label for the trigger (default 'Switch app'). */
  tooltip?: string
}

/** AppBar control that switches between the suite's apps. */
export function SuiteSwitcher({ links, tooltip = 'Switch app' }: SuiteSwitcherProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

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
            component="a"
            href={link.href}
            onClick={() => setAnchor(null)}
          >
            <ListItemText primary={link.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
