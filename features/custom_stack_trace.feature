Feature: Custom stack trace

  Scenario: Error.prepareStackTrace override
    Given a file named "features/a.feature" with:
      """
      Feature: Some feature
        Scenario: Some scenario
          Given Error.prepareStackTrace has been overriden
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {When} from 'cucumber'

      const _prepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = () => { return 'Custom message' }

      When(/^Error.prepareStackTrace has been overriden$/, function() {})

      Error.prepareStackTrace = _prepareStackTrace
      """
    When I run cucumber-js
    Then it passes
