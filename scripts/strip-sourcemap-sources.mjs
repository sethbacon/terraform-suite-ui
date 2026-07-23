// Strip embedded source text (sourcesContent) from the sourcemaps in dist/.
// Consumers keep useful stack traces (file/name/position mapping) while the
// published tarball stops shipping the entire source tree inside the maps —
// the public GitHub repo is the reference for source-level debugging.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
for (const file of readdirSync(dist)) {
  if (!file.endsWith('.map')) continue
  const path = join(dist, file)
  const map = JSON.parse(readFileSync(path, 'utf8'))
  if (map.sourcesContent) {
    delete map.sourcesContent
    writeFileSync(path, JSON.stringify(map))
    console.log(`stripped sourcesContent from ${path}`)
  }
}
