import FormatterBuilder from './builder'
import builtin from './builtin'
import { FormatterImplementation } from './index'

export async function resolveImplementation(
  specifier: string,
  cwd: string
): Promise<FormatterImplementation> {
  if (builtin[specifier]) {
    return builtin[specifier]
  } else {
    return await FormatterBuilder.loadCustomClass('formatter', specifier, cwd)
  }
}
