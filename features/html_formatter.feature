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
          world.attach('<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>', 'image/svg+xml')
        })
        """

    Scenario: Without externalAttachments option
      When I run cucumber-js with `--format html:html.out`
      Then it passes
      And the html formatter output is complete
      And the formatter has no externalised attachments

    Scenario: With externalAttachments as true
      When I run cucumber-js with `--format html:html.out --format-options '{"html":{"externalAttachments":true}}'`
      Then it passes
      And the html formatter output is complete
      And the formatter has these external attachments:
        | <svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg> |
        | Base64 text |
        | Plain text  |

    Scenario: With externalAttachments as array of mime type matchers
      When I run cucumber-js with `--format html:html.out --format-options '{"html":{"externalAttachments":["image/*"]}}'`
      Then it passes
      And the html formatter output is complete
      And the formatter has these external attachments:
        | <svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg> |
