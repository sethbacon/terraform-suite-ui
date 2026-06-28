/**
 * Brand and layout design tokens shared across the Terraform suite frontends.
 * Keep these in sync as the single source of truth for visual parity.
 */

/** Primary brand colour (indigo). */
export const BRAND_PRIMARY = '#5C4EE5'

/** Secondary accent in light mode (teal). */
export const SECONDARY_LIGHT = '#00796B'

/** Secondary accent in dark mode (brighter teal for contrast). */
export const SECONDARY_DARK = '#00D9C0'

/** Dark-mode surface colours, matched across both apps for shared depth. */
export const DARK_BG_DEFAULT = '#121212'
export const DARK_BG_PAPER = '#1e1e1e'

/** Application font stack. */
export const FONT_FAMILY = [
  'Inter',
  'Roboto',
  'Helvetica',
  'Arial',
  'system-ui',
  'sans-serif',
].join(',')

/** Base border radius (px). */
export const BORDER_RADIUS = 8

/** Languages rendered right-to-left. */
export const RTL_LANGUAGES: ReadonlySet<string> = new Set(['ar', 'he', 'fa', 'ur', 'yi'])
