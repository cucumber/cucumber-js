import type { FormatterPlugin } from '../plugin'
import { doesNotHaveValue } from '../value_checker'
import type { FormatterImplementation } from './index'

export function findClassOrPlugin(imported: unknown): FormatterImplementation | null {
  return findRecursive(imported, 3)
}

function findRecursive(thing: unknown, depth: number): FormatterImplementation | null {
  if (doesNotHaveValue(thing)) {
    return null
  }
  if (typeof thing === 'function') {
    return thing as FormatterImplementation
  }
  if (typeof thing === 'object' && (thing as FormatterPlugin).type === 'formatter') {
    return thing as FormatterImplementation
  }
  depth--
  if (depth > 0) {
    return findRecursive((thing as { default?: unknown }).default, depth)
  }
  return null
}
