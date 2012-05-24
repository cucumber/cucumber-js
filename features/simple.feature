Feature: Simple Feature

  Scenario: display Cucumber version
    When I run `cucumber.js --version`
    Then I see the version of Cucumber
