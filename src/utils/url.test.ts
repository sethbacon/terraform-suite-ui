import { describe, expect, it } from 'vitest'
import { isSafeUrl } from './url'

describe('isSafeUrl', () => {
  it.each([
    'https://example.com',
    'http://example.com/path?x=1',
    'mailto:a@b.com',
    'tel:+15551234567',
    '/relative/path',
    './relative',
    '#anchor',
  ])('accepts %s', (value) => {
    expect(isSafeUrl(value)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'javascript:alert(1)//safe.com',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    '//evil.com',
    '/\\evil.com',
    '\\\\evil.com',
    '',
    '   ',
    null,
    undefined,
  ])('rejects %s', (value) => {
    expect(isSafeUrl(value as string | null | undefined)).toBe(false)
  })
})
