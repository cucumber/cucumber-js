// Tests depend on the lines the steps are defined on

import { buildSupportCodeLibrary } from '../runtime_helpers'
import { ISupportCodeLibrary } from '../../src/support_code_library_builder/types'
import { InstalledClock } from '@sinonjs/fake-timers'
import { World } from '../../src'

export function getJsonFormatterSupportCodeLibrary(
  clock: InstalledClock
): ISupportCodeLibrary {
  return buildSupportCodeLibrary(__dirname, ({ Given }) => {
    Given('a passing step', function () {
      clock.tick(1)
    })

    let willPass = false
    Given('a flaky step', function () {
      if (willPass) {
        return
      }
      willPass = true
      throw 'error' // eslint-disable-line @typescript-eslint/no-throw-literal
    })

    Given('a failing step', function () {
      throw 'error' // eslint-disable-line @typescript-eslint/no-throw-literal
    })

    Given('a step that attaches', async function (this: World) {
      await this.attach(Buffer.from([137, 80, 78, 71]), 'image/png')
    })

    Given('a step {int}', function (_int: Number) {})
  })
}

export function getJsonFormatterSupportCodeLibraryWithHooks(): ISupportCodeLibrary {
  return buildSupportCodeLibrary(__dirname, ({ After, Before, Given }) => {
    Given('a passing step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
    Before(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
    After(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
  })
}
