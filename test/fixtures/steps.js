// Tests depend on the lines the steps are defined on

import { buildSupportCodeLibrary } from '../runtime_helpers'

export function getBaseSupportCodeLibrary() {
  return buildSupportCodeLibrary(__dirname, ({ Given }) => {
    Given('a failing step', function() {
      throw 'error' // eslint-disable-line no-throw-literal
    })

    Given('an ambiguous step', function() {})
    Given(/an? ambiguous step/, function() {})

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

    Given('a passing step', function() {})

    Given('a skipped step', function() {
      return 'skipped'
    })
  })
}
