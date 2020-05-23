Feature: Data Tables
  Data Tables can be places underneath a step and will be passed as the last
  argument to the step definition. They can be used to represent richer data
  structures, and can also be transformed to other types.

  Scenario: transposed table
    When the following table is transposed:
      | a | b |
      | 1 | 2 |
    Then it should be:
      | a | 1 |
      | b | 2 |
