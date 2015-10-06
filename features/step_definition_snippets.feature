Feature: step definition snippets

  Scenario Outline: escape regexp special characters
    Given a file named "features/special.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step with <character>
      """
    When I run cucumber-js
    Then it suggests a "Given" step definition snippet for:
       """
       /^a step with \<character>$/
       """

    Examples:
      | character |
      | -         |
      | [         |
      | ]         |
      | {         |
      | }         |
      | (         |
      | )         |
      | *         |
      | +         |
      | ?         |
      | .         |
      | \         |
      | /         |
      | ^         |
      | $         |
      | #         |

  Scenario: numbers
    Given a file named "features/number.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step numbered 5
      """
    When I run cucumber-js
    Then it suggests a "Given" step definition snippet with 1 parameter for:
      """
      /^a step numbered (/d+)$/
      """

  Scenario: quoted strings
    Given a file named "features/number.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step with "quotes"
      """
    When I run cucumber-js
    Then it suggests a "Given" step definition snippet with 1 parameter for:
      """
      /^a step with "([^"]*)"$/
      """

  Scenario: multiple quoted strings
    Given a file named "features/number.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step with "quotes" and "more quotes"
      """
    When I run cucumber-js
    Then it suggests a "Given" step definition snippet with 2 parameters for:
      """
      /^a step with "([^"]*)" and "([^"]*)"$/
      """

  Scenario: placeholders in scenario outlines
    Given a file named "features/number.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a step with a <placeholder>

        Examples:
          | placeholder |
          | cucumbers   |
      """
    When I run cucumber-js
    Then it suggests a "Given" step definition snippet with 1 parameter named "placeholder" for:
      """
      /^a step with a (.*)$/
      """
