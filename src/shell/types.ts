import type { ReactNode } from 'react'

export interface NavItem {
  /** Route path this item links to. */
  path: string
  /** i18n key for the label. */
  labelKey: string
  /** i18n key for the sidebar tooltip (optional). */
  tooltipKey?: string
  /** Leading icon element. */
  icon: ReactNode
  /** Scope required to see this item; null = always visible to authenticated users. */
  scope: string | null
}

export interface NavGroup {
  key: string
  /** i18n key for the collapsible group header. */
  labelKey: string
  items: NavItem[]
}

export interface SuiteLink {
  /** Display label for the suite entry. */
  label: string
  /** Absolute URL to the suite app. */
  href: string
  /** Marks the current app (highlighted in the switcher). */
  current?: boolean
}
