Feature: Step definitino files can b configured to have different file extensions

  Scenario: .jsx step definition files are included according to the config
    Given a file named "features/step_definitions/cucumber_steps.jsx" with:
      """
      import {Given} from 'cucumber'

      Given(/^a new step in a \.jsx file$/, function() {})
      """
    And a file named "features/run_the_steps.feature" with:
      """
      Feature: testing that the .jsx steps are run
        Scenario: running the steps
          Given a new step in a .jsx file
      """
    When I run cucumber-js with `--support-file-extension .js?(x)`
    Then the step "a new step in a .jsx file" has status "passed"
