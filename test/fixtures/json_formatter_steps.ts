// Tests depend on the lines the steps are defined on

import { InstalledClock } from '@sinonjs/fake-timers'
import { buildSupportCodeLibrary } from '../runtime_helpers'
import { SupportCodeLibrary } from '../../src/support_code_library_builder/types'
import { World } from '../../src'

export function getJsonFormatterSupportCodeLibrary(
  clock: InstalledClock
): SupportCodeLibrary {
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

    Given(
      'a step that attaches buffer \\(image\\/png)',
      async function (this: World) {
        await this.attach(Buffer.from([137, 80, 78, 71]), 'image/png')
      }
    )

    Given(
      'a step that attaches base64-encoded string',
      async function (this: World) {
        await this.attach(
          Buffer.from('foo').toString('base64'),
          'base64:text/plain'
        )
      }
    )

    Given('a step that attaches string literal', async function (this: World) {
      await this.attach('foo', 'text/plain')
    })

    Given('a step {int}', function (_int: Number) {})
  })
}

export function getJsonFormatterSupportCodeLibraryWithHooks(): SupportCodeLibrary {
  return buildSupportCodeLibrary(__dirname, ({ After, Before, Given }) => {
    Given('a passing step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
    Before(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
    After(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
  })
}
