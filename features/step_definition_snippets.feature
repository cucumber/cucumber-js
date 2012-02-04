Feature: step definition snippets

  Scenario: escape regexp special characters
    Given a scenario with:
      """
      Given I am a happy veggie \o/
      When I type -[]{}()*+?.\^$|#/
      """
    When Cucumber executes the scenario
    Then a "Given" step definition snippet for /^I am a happy veggie \\o\/$/ is suggested
    Then a "When" step definition snippet for /^I type \-\[\]\{\}\(\)\*\+\?\.\\\^\$\|\#\/$/ is suggested

  Scenario: step matching groups
    Given a scenario with:
      """
      Given I have 5 "kekiri" cucumbers
      """
    When Cucumber executes the scenario
    Then a "Given" step definition snippet for /^I have (\d+) "([^"]*)" cucumbers$/ with 2 parameters is suggested

  Scenario: multiple matching groups
    Given a scenario with:
      """
      Given I have some "hekiri", "wild" and "regular" cucumbers
      """
    When Cucumber executes the scenario
    Then a "Given" step definition snippet for /^I have some "([^"]*)", "([^"]*)" and "([^"]*)" cucumbers$/ with 3 parameters is suggested
