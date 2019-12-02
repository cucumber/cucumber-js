// Tests depend on the lines the steps are defined on

import { buildSupportCodeLibrary } from '../runtime_helpers'

export function getUsageJsonFormatterSupportCodeLibrary(clock) {
  return buildSupportCodeLibrary(({ Given }) => {
    Given('abc', function() {
      clock.tick(1)
    })

    Given(/def/, function() {
      clock.tick(2)
    })

    Given('ghi', function() {})
  })
}
