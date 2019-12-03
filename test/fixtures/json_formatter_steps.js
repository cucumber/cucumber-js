// Tests depend on the lines the steps are defined on

import { buildSupportCodeLibrary } from '../runtime_helpers'

export function getJsonFormatterSupportCodeLibrary(clock) {
  return buildSupportCodeLibrary(({ Given }) => {
    Given('a passing step', function() {
      clock.tick(1)
    })

    let willPass = false
    Given('a flaky step', function() {
      if (willPass) {
        return
      }
      willPass = true
      throw 'error' // eslint-disable-line no-throw-literal
    })

    Given('a failing step', function() {
      throw 'error' // eslint-disable-line no-throw-literal
    })
  })
}

export function getJsonFormatterSupportCodeLibraryWithHooks() {
  return buildSupportCodeLibrary(({ After, Before, Given }) => {
    Given('a passing step', function() {})
    Before(function() {})
    After(function() {})
  })
}
