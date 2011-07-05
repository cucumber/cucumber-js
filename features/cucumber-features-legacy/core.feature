Feature: Core feature elements execution
  In order to have automated acceptance tests
  As a developer
  I want Cucumber to run core feature elements

  Scenario: Simple flat steps
    Given a step definition matching /^a step passes$/
    When I run the following feature:
      """
      Feature: Simple flat steps
        In order to execute features
        As cucumber
        I want to run features successfully

        Scenario: Simple flat step
          Given a step passes
          When a step passes
          Then a step passes
      """
    Then the feature should have run successfully

  Scenario: Given, When, Then, And and But steps
    Given a "Given" step definition matching /^a "Given" step passes$/
    And a "When" step definition matching /^a "When" step passes$/
    And a "Then" step definition matching /^a "Then" step passes$/
    When I run the following feature:
      """
      Feature: Given, When, Then, And and But step execution
        Scenario: All kinds of steps
          Given a "Given" step passes
          When a "When" step passes
          Then a "Then" step passes

        Scenario: All kinds of steps with And's and But's
          Given a "Given" step passes
          And a "Given" step passes
          But a "Given" step passes
          When a "When" step passes
          And a "When" step passes
          But a "When" step passes
          Then a "Then" step passes
          And a "Then" step passes
          But a "Then" step passes
      """
    Then the feature should have run successfully

  Scenario: Step definition body is executed
    Given a step definition matching /^I call a watched step$/ counting its calls
    And a step definition matching /^the watched step should have been called (\d+) times?$/ checking the number of step calls
    When I run the following feature:
      """
      Feature: Step definition body execution
        Scenario: Step definition body is executed once
          When I call a watched step
          Then the watched step should have been called 1 time

        Scenario: Step definition body is executed several times
          When I call a watched step
          And I call a watched step
          And I call a watched step
          Then the watched step should have been called 3 times
      """
    Then the feature should have run successfully      

  Scenario: Steps accepting parameters
    Given a step definition matching /^I call a step with "(.*)"$/ recording its parameters
    And a step definition matching /^I call a step with "(.*)", "(.*)" and "(.*)"$/ recording its parameters
    And a step definition matching /^the (\d+)(?:st|nd|rd) received parameter should be "(.*)"$/ checking a recorded parameter
    When I run the following feature:
      """
      Feature: Steps receiving parameters
        Scenario: Single-parameter step
          When I call a step with "a parameter"
          Then the 1st received parameter should be "a parameter"

        Scenario: Three-parameter step
          When I call a step with "one", "two" and "three"
          Then the 1st received parameter should be "one"
          And the 2nd received parameter should be "two"
          And the 3rd received parameter should be "three"
      """
    Then the feature should have run successfully

  Scenario: Steps accepting a DocString parameter
    Given a step definition matching /^I call a step with the following text:$/ recording its parameters
    And a step definition matching /^I call a step with "(.*)" and the following text:$/ recording its parameters
    And a step definition matching /^the (\d+)(?:st|nd) received parameter should be "(.*)"$/ checking a recorded parameter
    And a step definition matching /^the (\d+)(?:nd) received parameter should be:$/ checking a recorded parameter
    When I run the following feature:
      """
      Feature: Steps receiving a DocString parameter
        Scenario: One-liner DocString parameter
          When I call a step with the following text:
            \"\"\"
            The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae.
            \"\"\"
          Then the 1st received parameter should be "The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae."

        Scenario: Matching group and one-liner DocString
          When I call a step with "Cucumber" and the following text:
            \"\"\"
            The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae.
            \"\"\"
          Then the 1st received parameter should be "Cucumber"
          And the 2nd received parameter should be "The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae."
      
        Scenario: Matching group and multiline DocString
          When I call a step with "Cucumber" and the following text:
            \"\"\"
            cu·cum·ber |ˈkyoōˌkəmbər|
            noun
              1. a long, green-skinned fruit with watery flesh, usually eaten raw in salads or pickled.
              2. the climbing plant of the gourd family that yields this fruit, native to the Chinese Himalayan region. It is widely cultivated but very rare in the wild. • Cucumis sativus, family Cucurbitaceae.
            \"\"\"
          Then the 1st received parameter should be "Cucumber"
          And the 2nd received parameter should be:
            \"\"\"
            cu·cum·ber |ˈkyoōˌkəmbər|
            noun
              1. a long, green-skinned fruit with watery flesh, usually eaten raw in salads or pickled.
              2. the climbing plant of the gourd family that yields this fruit, native to the Chinese Himalayan region. It is widely cultivated but very rare in the wild. • Cucumis sativus, family Cucurbitaceae.
            \"\"\"
      """
    Then the feature should have run successfully
