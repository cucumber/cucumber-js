import builtin from './builtin'
import { importCode } from './import_code'
import { resolveClassOrPlugin } from './resolve_class_or_plugin'
import { FormatterImplementation } from './index'

export async function resolveImplementation(
  specifier: string,
  cwd: string
): Promise<FormatterImplementation> {
  if (builtin[specifier]) {
    return builtin[specifier]
  } else {
    const imported = await importCode(specifier, cwd)
    const resolved = resolveClassOrPlugin(imported)
    if (!resolved) {
      throw new Error(
        `Custom formatter (${specifier}) does not export a function/class`
      )
    }
    return resolved
  }
}
