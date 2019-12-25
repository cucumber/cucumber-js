// Tests depend on the lines the steps are defined on

import { buildSupportCodeLibrary } from '../runtime_helpers'
import { ISupportCodeLibrary } from '../../src/support_code_library_builder/types'

export function getBaseSupportCodeLibrary(): ISupportCodeLibrary {
  return buildSupportCodeLibrary(__dirname, ({ Given }) => {
    Given('a failing step', function() {
      throw 'error' // eslint-disable-line no-throw-literal
    })

    Given('an ambiguous step', function() {}) // eslint-disable-line @typescript-eslint/no-empty-function
    Given(/an? ambiguous step/, function() {}) // eslint-disable-line @typescript-eslint/no-empty-function

    Given('a pending step', function() {
      return 'pending'
    })

    let willPass = false
    Given('a flaky step', function() {
      if (willPass) {
        return
      }
      willPass = true
      throw 'error' // eslint-disable-line no-throw-literal
    })

    Given('a passing step', function() {}) // eslint-disable-line @typescript-eslint/no-empty-function

    Given('a skipped step', function() {
      return 'skipped'
    })

    Given('attachment step1', function() {
      this.attach('Some info')
      this.attach('{"name": "some JSON"}', 'application/json')
      this.attach(Buffer.from([137, 80, 78, 71]), 'image/png')
    })

    Given('attachment step2', function() {
      this.attach('Other info')
      throw 'error' // eslint-disable-line no-throw-literal
    })
  })
}
