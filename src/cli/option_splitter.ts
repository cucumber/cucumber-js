export default class OptionSplitter {
  static split(option) {
    const parts = option.split(/([^A-Z]):(?!\\)/)

    return parts.reduce((memo, part, i) => {
      if (partNeedsRecombined(i)) {
        memo.push(parts.slice(i, i + 2).join(''))
      }

      return memo
    }, [])
  }
}

function partNeedsRecombined(i) {
  return i % 2 === 0
}
