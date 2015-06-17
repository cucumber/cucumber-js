Feature: Data Tables
  Scenario: a data table can be read as a hash
    Given the following data table in a step:
      """
      | Cucumber     | Cucumis sativus |
      | Burr Gherkin | Cucumis anguria |
      """
    When the data table is passed to a step mapping that converts it to a hash
    Then the data table is converted to the following:
      """
      { "Cucumber":"Cucumis sativus", "Burr Gherkin": "Cucumis anguria" }
      """