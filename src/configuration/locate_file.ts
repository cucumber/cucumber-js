import path from 'node:path'
import fs from 'mz/fs'

const DEFAULT_FILENAMES = [
  'cucumber.js',
  'cucumber.cjs',
  'cucumber.mjs',
  'cucumber.json',
  'cucumber.yaml',
  'cucumber.yml',
]

export function locateFile(cwd: string): string | undefined {
  return DEFAULT_FILENAMES.find((filename) =>
    fs.existsSync(path.join(cwd, filename))
  )
}
