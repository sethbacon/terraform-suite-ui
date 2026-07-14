import { createTheme, type Theme } from '@mui/material/styles'
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

// MUI's decomposeColor (reached via createTheme -> augmentColor) accepts only #hex, rgb()/rgba(),
// hsl()/hsla() and color() values and THROWS for anything else (including CSS named colors like
// "red" or a hex missing its '#'). A runtime whitelabel override colour that fails this check must
// fall back to the built-in token rather than crash the consuming app's render tree.
function isValidThemeColor(value: string | undefined): value is string {
  if (!value) return false
  const v = value.trim()
  return (
    /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ||
    /^(rgb|rgba|hsl|hsla|color)\(/i.test(v)
  )
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

  return createTheme({
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
  })
}
