import { pathToFileURL } from 'node:url'
import path from 'node:path'

export async function importCode(specifier: string, cwd: string): Promise<any> {
  let normalized: URL | string = specifier
  if (specifier.startsWith('.')) {
    normalized = pathToFileURL(path.resolve(cwd, specifier))
  } else if (specifier.startsWith('file://')) {
    normalized = new URL(specifier)
  }
  return await import(normalized.toString())
}
