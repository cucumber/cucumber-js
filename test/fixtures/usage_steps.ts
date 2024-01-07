// Tests depend on the lines the steps are defined on

import { InstalledClock } from '@sinonjs/fake-timers'
import { buildSupportCodeLibrary } from '../runtime_helpers'
import { SupportCodeLibrary } from '../../src/support_code_library_builder/types'

export function getUsageSupportCodeLibrary(
  clock: InstalledClock
): SupportCodeLibrary {
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
