Feature: Examples Tables
  Sometimes it can be desireable to run the same scenario multiple times
  with different data each time. This can be done by placing an Examples
  section with an Examples Table underneath a Scenario, and use <placeholders>
  in the Scenario, matching the table headers.

  Scenario Outline: eating cucumbers
    Given there are <start> cucumbers
    When I eat <eat> cucumbers
    Then I should have <left> cucumbers

    Examples: These are passing
      | start | eat | left |
      |    12 |   5 |    7 |
      |    20 |   5 |   15 |

    Examples: These are failing
      | start | eat | left |
      |    12 |  20 |    0 |
      |     0 |   1 |    0 |

    Examples: These are undefined because the value is not an {int}
      | start | eat    | left  |
      |    12 | banana |    12 |
      |     0 |      1 | apple |
