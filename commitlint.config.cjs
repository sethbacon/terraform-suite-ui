module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Commit bodies here favor one bullet per changelog-worthy item, which can
    // reasonably exceed the default 100-char wrap (e.g. an "issue: what/why/how"
    // bullet). The header (type/scope/subject) still enforces the default limit.
    'body-max-line-length': [0, 'always', Infinity],
  },
}
