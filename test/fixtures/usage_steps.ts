// Tests depend on the lines the steps are defined on

import { buildSupportCodeLibrary } from '../runtime_helpers'
import { ISupportCodeLibrary } from '../../src/support_code_library_builder/types'
import { InstalledClock } from '@sinonjs/fake-timers'

export function getUsageSupportCodeLibrary(
  clock: InstalledClock
): ISupportCodeLibrary {
  return buildSupportCodeLibrary(__dirname, ({ Given }) => {
    Given('abc', function () {
      clock.tick(1)
    })

    let count = 0
    Given(/def?/, function () {
      if (count === 0) {
        clock.tick(2)
        count += 1
      } else {
        clock.tick(1)
      }
    })

    Given('ghi', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
  })
}
