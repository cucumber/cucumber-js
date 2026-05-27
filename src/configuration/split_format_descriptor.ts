// a formatter and an optional target, separated by a colon, where each part is
// either "quoted" (and may contain colons) or bare (and may not)
const pattern = /^(?:"([^"]*)"|([^:]*))(?::(?:"([^"]*)"|([^:]*)))?$/

export function splitFormatDescriptor(option: string): string[] {
  const match = option.match(pattern)
  if (match === null) {
    throw new Error(
      `Could not parse "${option}"; wrap each part in double quotes if it contains a colon`
    )
  }
  const [, quotedName, bareName, quotedTarget, bareTarget] = match
  return [quotedName ?? bareName, quotedTarget ?? bareTarget ?? '']
}
