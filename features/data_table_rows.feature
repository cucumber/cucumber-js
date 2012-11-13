Feature: Data Tables

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
