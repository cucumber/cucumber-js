import builtin from './builtin'
import { importCode } from './import_code'
import { findClassOrPlugin } from './find_class_or_plugin'
import { FormatterImplementation } from './index'

export async function resolveImplementation(
  specifier: string,
  cwd: string
): Promise<FormatterImplementation> {
  if (builtin[specifier]) {
    return builtin[specifier]
  } else {
    const imported = await importCode(specifier, cwd)
    const found = findClassOrPlugin(imported)
    if (!found) {
      throw new Error(`${specifier} does not export a function/class`)
    }
    return found
  }
}
