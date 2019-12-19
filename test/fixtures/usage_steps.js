// Tests depend on the lines the steps are defined on

import { buildSupportCodeLibrary } from '../runtime_helpers'

export function getUsageSupportCodeLibrary(clock) {
  return buildSupportCodeLibrary(__dirname, ({ Given }) => {
    Given('abc', function() {
      clock.tick(1)
    })

    let count = 0
    Given(/def?/, function() {
      if (count === 0) {
        clock.tick(2)
        count += 1
      } else {
        clock.tick(1)
      }
    })

    Given('ghi', function() {})
  })
}
