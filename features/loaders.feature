@esm
Feature: ESM loaders support

  I want to nominate one or more loaders to use to transpile my code
  So that I can write my source code in another language
  As a user

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
      """
    And a file named "features/steps.ts" with:
      """
      import { Given } from '@cucumber/cucumber'

      interface Something {
        field1: string
        field2: string
      }

      Given('a passing step', () => {})
      """
    And a file named "tsconfig.json" with:
      """
      {
        "compilerOptions": {
          "module": "esnext",
          "moduleResolution": "nodenext"
        }
      }
      """

  Scenario:
    When I run cucumber-js with `--loader ts-node/esm --import features/steps.ts`
    Then it passes