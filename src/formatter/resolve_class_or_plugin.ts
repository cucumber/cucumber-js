import { doesNotHaveValue } from '../value_checker'

export function resolveClassOrPlugin(imported: any) {
  if (doesNotHaveValue(imported)) {
    return null
  }
  if (typeof imported === 'function') {
    return imported
  } else if (typeof imported === 'object' && imported.type === 'formatter') {
    return imported
  } else if (
    typeof imported === 'object' &&
    typeof imported.default === 'function'
  ) {
    return imported.default
  } else if (
    typeof imported.default === 'object' &&
    imported.default.type === 'formatter'
  ) {
    return imported.default
  } else if (
    typeof imported.default === 'object' &&
    typeof imported.default.default === 'function'
  ) {
    return imported.default.default
  }
  return null
}
