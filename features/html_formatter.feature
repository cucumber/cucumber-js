Feature: HTML formatter

  Rule: Attachments except logs are externalised based on the externalAttachments option

    Background:
      Given a file named "features/a.feature" with:
        """
        Feature: a feature
          Scenario: a scenario
            Given a step
        """
      And a file named "features/steps.js" with:
        """
        const {Given, world} = require('@cucumber/cucumber')

        Given('a step', () => {
          world.log('Logging some info')
          world.link('https://cucumber.io')
          world.attach(btoa('Base64 text'), 'base64:text/plain')
          world.attach('Plain text', 'text/plain')
        })
        """

    Scenario: Without externalAttachments option
      When I run cucumber-js with `--format html:html.out`
      Then it passes
      And the html formatter output is complete
      And the formatter has no externalised attachments

    Scenario: With externalAttachments option
      When I run cucumber-js with `--format html:html.out --format-options '{"html":{"externalAttachments":true}}'`
      Then it passes
      And the html formatter output is complete
      And the formatter has these external attachments:
        | Base64 text |
        | Plain text  |