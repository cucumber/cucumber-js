Feature: Data Tables

  Scenario: a data table interpreted as an array
    Given a scenario with:
      """
      Given the following cukes:
        | Cucumis sativus | Cucumber     |
        | Cucumis anguria | Burr Gherkin |
      """
    And the step "the following cukes:" has a passing mapping that receives a data table
    When Cucumber executes the scenario
    Then the scenario passes
    And the received data table array equals the following:
      """
      [
        [ "Cucumis sativus", "Cucumber" ],
        [ "Cucumis anguria", "Burr Gherkin" ]
      ]
      """

  Scenario: a data table can be read as an array of hashes
    Given the following data table in a step:
      """
      | Latin           | English      |
      | Cucumis sativus | Cucumber     |
      | Cucumis anguria | Burr Gherkin |
      """
    When the data table is passed to a step mapping that converts it to key/value pairs
    Then the data table is converted to the following:
      """
      [
        { "Latin":"Cucumis sativus", "English":"Cucumber" },
        { "Latin":"Cucumis anguria", "English":"Burr Gherkin" }
      ]
      """

  Scenario: a data table can be read as an array of values
    Given the following data table in a step:
      """
      | Latin           | English      |
      | Cucumis sativus | Cucumber     |
      | Cucumis anguria | Burr Gherkin |
      """
    When the data table is passed to a step mapping that gets the row arrays without the header
    Then the data table is converted to the following:
      """
      [
        [ "Cucumis sativus", "Cucumber" ],
        [ "Cucumis anguria", "Burr Gherkin" ]
      ]
      """