Feature: Stack traces
  Nothing beats stack traces when it comes to diagnosing the source of a bug.
  Cucumber provides helpful stack traces that:
  
  - Include a stack frame from the Gherkin document
  - Remove uninteresting frames by default

  The first line of the stack trace must contain the feature file.

  Scenario: A failing step
    When a step throws an exception
