export type ThemeMode = 'light' | 'dark'
export type Direction = 'ltr' | 'rtl'

/** Optional colour overrides, typically sourced from a runtime whitelabel config. */
export interface ThemeOverrides {
  primary?: string
  secondaryLight?: string
  secondaryDark?: string
}

/** Runtime whitelabel configuration (all fields optional). */
export interface UIThemeConfig {
  product_name?: string
  primary_color?: string
  secondary_color_light?: string
  secondary_color_dark?: string
  logo_url?: string
  favicon_url?: string
  login_hero_url?: string
}

export interface SuiteThemeContextValue {
  mode: ThemeMode
  /** Toggle light/dark and persist the explicit choice. */
  toggleTheme: () => void
  /** Text direction derived from the active language (RTL for ar/he/fa/ur/yi). */
  direction: Direction
  /** Display name from the whitelabel config, or the configured default. */
  productName: string
  /** Logo image URL from the whitelabel config, or null. */
  logoUrl: string | null
  /** Login-page hero image URL from the whitelabel config, or null. */
  loginHeroUrl: string | null
}
