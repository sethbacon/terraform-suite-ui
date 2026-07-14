/**
 * Public utility exports. Only the URL guard is part of the package's public API so consumers can
 * reuse the same defense-in-depth check the library applies to its own navigation/image sinks.
 * The localStorage helpers in ./storage are internal and intentionally not re-exported here.
 */
export { isSafeUrl } from './url'
