// Tests depend on the lines the steps are defined

import { buildSupportCodeLibrary } from '../runtime_helpers'

export function getUsageJsonSupportCodeLibrary(clock) {
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
