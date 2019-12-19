export function doesHaveValue(value: any) {
  return !doesNotHaveValue(value)
}

export function doesNotHaveValue(value: any) {
  return value === null || value === undefined
}

export function valueOrDefault<T>(value: T, defaultValue: T): T {
  if (doesHaveValue(value)) {
    return value
  }
  return defaultValue
}
