import { doesNotHaveValue } from '../value_checker'

export function findClassOrPlugin(imported: any) {
  return findRecursive(imported, 3)
}

function findRecursive(thing: any, depth: number): any {
  if (doesNotHaveValue(thing)) {
    return null
  }
  if (typeof thing === 'function') {
    return thing
  }
  if (typeof thing === 'object' && thing.type === 'formatter') {
    return thing
  }
  depth--
  if (depth > 0) {
    return findRecursive(thing.default, depth)
  }
  return null
}
