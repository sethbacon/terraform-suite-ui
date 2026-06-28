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
})
