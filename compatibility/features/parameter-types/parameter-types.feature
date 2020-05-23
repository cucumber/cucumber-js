Feature: Parameter Types
  Cucumber lets you define your own parameter types, which can be used
  in Cucumber Expressions. This lets you define a precise domain-specific
  vocabulary which can be used to generate a glossary with examples taken
  from your scenarios. They also let you transform strings and tables into
  rich types.

  Scenario: flights
    Given LHR-CDG has been delayed 45 minutes
