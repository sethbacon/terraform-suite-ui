import { describe, expect, it } from 'vitest'
import { createAppTheme } from './createAppTheme'
import { BRAND_PRIMARY, DARK_BG_DEFAULT } from '../tokens'

describe('createAppTheme', () => {
  it('uses the brand primary by default', () => {
    expect(createAppTheme('light').palette.primary.main).toBe(BRAND_PRIMARY)
  })

  it('applies dark surfaces in dark mode', () => {
    expect(createAppTheme('dark').palette.background.default).toBe(DARK_BG_DEFAULT)
  })

  it('honours colour overrides', () => {
    const theme = createAppTheme('light', false, 'ltr', { primary: '#123456' })
    expect(theme.palette.primary.main).toBe('#123456')
  })

  it('sets the text direction', () => {
    expect(createAppTheme('light', false, 'rtl').direction).toBe('rtl')
  })

  it('disables transitions when reduced motion is requested', () => {
    expect(createAppTheme('light', true).transitions.create()).toBe('none')
  })

  it('falls back to the built-in token for a regex-shaped but unparseable colour', () => {
    // These pass a naive /^(rgb|rgba|hsl|hsla|color)\(/ prefix check but MUI's
    // decomposeColor throws on them inside createTheme — the exact class of value
    // that used to white-screen the app (issue #79).
    for (const evil of ['color(display-p4 1 1 1)', 'color(evilspace 1 2 3)']) {
      const theme = createAppTheme('light', false, 'ltr', { primary: evil })
      expect(theme.palette.primary.main).toBe(BRAND_PRIMARY)
    }
  })

  it('accepts a valid color() value in a supported colour space', () => {
    const theme = createAppTheme('light', false, 'ltr', { primary: 'color(display-p3 0.5 0.3 0.2)' })
    expect(theme.palette.primary.main).toBe('color(display-p3 0.5 0.3 0.2)')
  })

  it('still rejects plainly invalid colours (named colours, missing #)', () => {
    for (const bad of ['not-a-color', 'red', '123456']) {
      const theme = createAppTheme('light', false, 'ltr', { primary: bad })
      expect(theme.palette.primary.main).toBe(BRAND_PRIMARY)
    }
  })

  it('never throws for any override shape (defensive net)', () => {
    // Even if a value somehow slips past validation, createAppTheme must return
    // a usable theme rather than crash the app render tree.
    for (const v of ['color(', 'rgb(', 'hsl(banana)', '#zzz', '']) {
      expect(() => createAppTheme('dark', false, 'ltr', { primary: v })).not.toThrow()
    }
  })
})
