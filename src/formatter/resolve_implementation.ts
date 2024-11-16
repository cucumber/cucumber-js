import builtin from './builtin'
import { importCode } from './import_code'
import { findClassOrPlugin } from './find_class_or_plugin'
import { FormatterImplementation } from './index'

export async function resolveImplementation(
  specifier: string,
  cwd: string
): Promise<FormatterImplementation> {
  const fromBuiltin = builtin[specifier]
  if (fromBuiltin) {
    if (typeof fromBuiltin !== 'string') {
      return fromBuiltin
    } else {
      specifier = fromBuiltin
    }
  }
  const imported = await importCode(specifier, cwd)
  const found = findClassOrPlugin(imported)
  if (!found) {
    throw new Error(`${specifier} does not export a function/class`)
  }
  return found
}
