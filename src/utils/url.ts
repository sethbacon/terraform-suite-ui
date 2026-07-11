/**
 * Returns true iff `value` is safe to assign to a DOM navigation/URL sink (`href`, `src`,
 * `window.open`, `location`, etc.): an absolute `http:`/`https:`/`mailto:`/`tel:` URL, or a
 * same-document-relative path/hash (`/foo`, `./foo`, `#foo`). Rejects everything else,
 * including `javascript:`/`data:`/`vbscript:`/`file:` schemes and protocol-relative URLs
 * (`//evil.com`), which is an allowlist (not a denylist) precisely so unknown/future schemes
 * fail closed rather than open.
 *
 * This is a defense-in-depth boundary check for a SHARED component library: even though today's
 * callers may only ever supply trusted values, a sink reused across every consuming app should
 * not assume that will always remain true.
 */
export function isSafeUrl(value: string | null | undefined): value is string {
  if (!value) return false
  const trimmed = value.trim()
  if (trimmed === '') return false

  // Protocol-relative ("//evil.com") and its backslash variants ("/\evil.com", "\\evil.com")
  // — browsers may treat a leading backslash as a slash, an ambiguous-scheme trick used to
  // bypass naive "starts with /" checks. Treat all of these as unsafe.
  if (/^[/\\]{2}/.test(trimmed) || /^\/\\/.test(trimmed)) return false

  // Relative path or same-page anchor — never carries a scheme, safe.
  if (/^[/#.]/.test(trimmed)) return true

  // Absolute URL: parse and allowlist the scheme. Use the URL constructor (not a
  // startsWith/regex prefix check) so whitespace/control-character/encoding bypass
  // tricks (e.g. "java\tscript:") don't slip past a naive string match.
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:' || url.protocol === 'tel:'
  } catch {
    return false
  }
}
