Feature: Formatter options

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      Given('a step', function() {})
      """

  Rule: pretty-only options are read from the pretty key

    Scenario: includeFeatureLine omits the Feature: header
      Given a file named "cucumber.json" with:
        """
        { "default": { "format": ["pretty:pretty.out"] } }
        """
      When I run cucumber-js with `--format-options '{"pretty":{"includeFeatureLine":false}}'`
      Then it passes
      And the file "pretty.out" does not contain the text:
        """
        Feature: a feature
        """

    Scenario: by default the Feature: header is included
      Given a file named "cucumber.json" with:
        """
        { "default": { "format": ["pretty:pretty.out"] } }
        """
      When I run cucumber-js
      Then it passes
      And the file "pretty.out" contains the text:
        """
        Feature: a feature
        """

  Rule: malformed sub-options are rejected

    Scenario: pretty as a string
      When I run cucumber-js with `--format-options '{"pretty":"verbose"}'`
      Then it fails
      And the error output contains the text:
        """
        formatOptions.pretty must be a `object` type
        """

    Scenario: theme as an array
      When I run cucumber-js with `--format-options '{"theme":["dark"]}'`
      Then it fails
      And the error output contains the text:
        """
        formatOptions.theme must be a `object` type
        """
