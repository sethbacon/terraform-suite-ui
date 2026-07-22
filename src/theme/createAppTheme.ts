import { createTheme, decomposeColor, type Theme } from '@mui/material/styles'
import {
  BORDER_RADIUS,
  BRAND_PRIMARY,
  DARK_BG_DEFAULT,
  DARK_BG_PAPER,
  FONT_FAMILY,
  SECONDARY_DARK,
  SECONDARY_LIGHT,
} from '../tokens'
import type { Direction, ThemeMode, ThemeOverrides } from './types'

// createTheme -> augmentColor parses each palette colour with MUI's decomposeColor
// and THROWS for anything it cannot parse (a CSS named colour, a hex missing its
// '#', or a color() with an unsupported colour space like "color(display-p4 …)").
// A runtime whitelabel override that would throw must fall back to the built-in
// token rather than crash the consuming app's render tree, so this validator
// probes the value with the SAME parser createTheme uses — a prefix regex is not
// enough, because it accepts color() strings the parser then rejects.
function isValidThemeColor(value: string | undefined): value is string {
  if (!value) return false
  try {
    decomposeColor(value.trim())
    return true
  } catch {
    return false
  }
}

/**
 * Builds the MUI theme for the given mode. Colours, font stack, and the component
 * baseline are identical across the suite so the apps share look-and-feel. When
 * prefersReducedMotion is set, all MUI transitions are disabled to honour the OS
 * accessibility preference. direction flips the theme to RTL for right-to-left
 * languages. overrides applies runtime whitelabel colours (each validated; an
 * invalid colour falls back to the built-in token so createTheme never throws).
 */
export function createAppTheme(
  mode: ThemeMode,
  prefersReducedMotion = false,
  direction: Direction = 'ltr',
  overrides: ThemeOverrides = {},
): Theme {
  const primary = isValidThemeColor(overrides.primary) ? overrides.primary : BRAND_PRIMARY
  const secondaryOverride = mode === 'dark' ? overrides.secondaryDark : overrides.secondaryLight
  const secondary = isValidThemeColor(secondaryOverride)
    ? secondaryOverride
    : mode === 'dark'
      ? SECONDARY_DARK
      : SECONDARY_LIGHT

  const themeOptions = {
    direction,
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: secondary },
      ...(mode === 'dark' && {
        background: { default: DARK_BG_DEFAULT, paper: DARK_BG_PAPER },
      }),
    },
    typography: {
      fontFamily: FONT_FAMILY,
    },
    shape: { borderRadius: BORDER_RADIUS },
    ...(prefersReducedMotion && {
      transitions: {
        create: () => 'none',
        duration: {
          shortest: 0,
          shorter: 0,
          short: 0,
          standard: 0,
          complex: 0,
          enteringScreen: 0,
          leavingScreen: 0,
        },
      },
    }),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            '--brand-primary': primary,
            '--brand-secondary': secondary,
          },
          'pre, code': {
            backgroundColor: mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
            color: mode === 'dark' ? '#e6e6e6' : '#1e1e1e',
          },
          body: {
            scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : undefined,
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: mode === 'dark' ? '#2b2b2b' : undefined,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' ? '#6b6b6b' : undefined,
              borderRadius: BORDER_RADIUS,
            },
          },
        },
      },
    },
  }

  try {
    return createTheme(themeOptions)
  } catch {
    // Defensive net: a colour that slipped past isValidThemeColor and broke
    // createTheme must never white-screen the app. Rebuild with the built-in
    // tokens only (createAppTheme with no overrides uses known-valid values, so
    // this cannot recurse further).
    if (primary !== BRAND_PRIMARY || overrides.secondaryDark || overrides.secondaryLight) {
      return createAppTheme(mode, prefersReducedMotion, direction, {})
    }
    throw new Error('createAppTheme: built-in theme tokens failed to build')
  }
}
