Feature: Running scenarios in parallel with custom assignment

  @spawn
  Scenario: Bad parallel assignment helper uses 1 worker
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, setParallelCanAssign} = require('@cucumber/cucumber')

      setParallelCanAssign(() => false)

      Given('slow step', (done) => setTimeout(done, 50))
      """
    And a file named "features/a.feature" with:
      """
      Feature: only one worker works
        Scenario: someone must do work
          Given slow step

        Scenario: even if it's all the work
          Given slow step
      """
    When I run cucumber-js with `--parallel 2`
    Then the error output contains the text:
    """
    WARNING: All workers went idle 2 time(s). Consider revising handler passed to setParallelCanAssign.
    """
    And no pickles run at the same time

  Scenario: assignment is appropriately applied
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given, setParallelCanAssign} = require('@cucumber/cucumber')
      const {atMostOnePicklePerTag} = require('@cucumber/cucumber/lib/support_code_library_builder/parallel_can_assign_helpers')

      setParallelCanAssign(atMostOnePicklePerTag(["@complex", "@simple"]))

      Given('complex step', (done) => setTimeout(done, 3000))
      Given('simple step', (done) => setTimeout(done, 2000))
      """
    And a file named "features/a.feature" with:
      """
      Feature: adheres to setParallelCanAssign handler
        @complex
        Scenario: complex1
          Given complex step

        @complex
        Scenario: complex2
          Given complex step

        @simple
        Scenario: simple1
          Given simple step

        @simple
        Scenario: simple2
          Given simple step

        @simple
        Scenario: simple3
          Given simple step
      """
    When I run cucumber-js with `--parallel 2`
    Then it passes
    And the following sets of pickles execute at the same time:
      | complex1, simple1 |
      | complex1, simple2 |
      | complex2, simple2 |
      | complex2, simple3 |