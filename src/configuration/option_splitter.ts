export const OptionSplitter = {
  split(option: string): string[] {
    option = option.replace(/"/g, '')

    const parts = option.split(/((?:file){0}):(?!\\|\/\/)/)

    const result = parts.reduce((memo: string[], part: string, i: number) => {
      if (partNeedsRecombined(i)) {
        memo.push(parts.slice(i, i + 2).join(''))
      }

      return memo
    }, [])

    if (result.length === 1) {
      result.push('')
    }

    return result
  },
}

function partNeedsRecombined(i: number): boolean {
  return i % 2 === 0
}
