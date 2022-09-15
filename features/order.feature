Feature: Set the execution order

  Background: 
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        @a
        Scenario: first scenario
          Given a step
      
        @b
        Scenario Outline: second scenario - <ID>
          Given a step
      
          @c
          Examples:
            | ID |
            | X  |
            | Y  |
      
          @d
          Examples:
            | ID |
            | Z  |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      
      Given(/^a step$/, function() {})
      """

  Scenario: run in defined order scenario
    When I run cucumber-js with `--order defined`
    Then it runs the scenarios:
      | NAME                |
      | first scenario      |
      | second scenario - X |
      | second scenario - Y |
      | second scenario - Z |

  Scenario: run in random order with seed
    When I run cucumber-js with `--order random:234119`
    Then it runs the scenarios:
      | NAME                |
      | second scenario - Z |
      | second scenario - X |
      | second scenario - Y |
      | first scenario      |

  Rule: Scenarios can be run in the order of a rerun file

    Scenario: run in rerun order
      Given a file named "@rerun.txt" with:
        """
        features/a.feature:19
        features/a.feature:3
        features/a.feature:14
        """
      When I run cucumber-js with `--order rerun @rerun.txt`
      Then it runs the scenarios:
        | NAME                |
        | second scenario - Z |
        | first scenario      |
        | second scenario - Y |

    Scenario: run in rerun order with one incorrect line number
      Given a file named "@rerun.txt" with:
        """
        features/a.feature:19
        features/a.feature:2
        features/a.feature:14
        """
      When I run cucumber-js with `--order rerun @rerun.txt`
      Then it runs the scenarios:
        | NAME                |
        | second scenario - Z |
        | second scenario - Y |

    Scenario: run in rerun order without a rerun file
      When I run cucumber-js with `--order rerun`
      Then it fails
      And the error output contains the text:
        """
        Cannot use rerun order because features/a.feature:13 was not in the rerun order. Did you forget to specify @rerun.txt?      
        """
