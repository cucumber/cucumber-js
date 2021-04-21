import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  getGherkinExampleRuleMap,
  getGherkinScenarioLocationMap,
  getGherkinScenarioMap,
  getGherkinStepMap,
} from './gherkin_document_parser'
import {
  IParsedSourceWithEnvelopes,
  parse,
} from '../../../test/gherkin_helpers'
import * as messages from '@cucumber/messages'
import IGherkinDocument = messages.GherkinDocument

describe('GherkinDocumentParser', () => {
  describe('getGherkinStepMap', () => {
    it('works for a Background and Scenario', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenario()

      // Act
      const output = getGherkinStepMap(gherkinDocument)

      // Assert
      const backgroundStep =
        gherkinDocument.feature.children[0].background.steps[0]
      const scenarioStep = gherkinDocument.feature.children[1].scenario.steps[0]
      expect(output).to.eql({
        [backgroundStep.id]: backgroundStep,
        [scenarioStep.id]: scenarioStep,
      })
    })

    it('works for a Background and Scenario Outline', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenarioOutline()

      // Act
      const output = getGherkinStepMap(gherkinDocument)

      // Assert
      const backgroundStep =
        gherkinDocument.feature.children[0].background.steps[0]
      const outlineStep = gherkinDocument.feature.children[1].scenario.steps[0]
      expect(output).to.eql({
        [backgroundStep.id]: backgroundStep,
        [outlineStep.id]: outlineStep,
      })
    })

    it('works for a Background and Rule with Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithExamples()

      // Act
      const output = getGherkinStepMap(gherkinDocument)

      // Assert
      const backgroundStep =
        gherkinDocument.feature.children[0].background.steps[0]
      const example1When =
        gherkinDocument.feature.children[1].rule.children[0].scenario.steps[0]
      const example1Then =
        gherkinDocument.feature.children[1].rule.children[0].scenario.steps[1]
      const example2When =
        gherkinDocument.feature.children[1].rule.children[1].scenario.steps[0]
      const example2Then =
        gherkinDocument.feature.children[1].rule.children[1].scenario.steps[1]
      expect(output).to.eql({
        [backgroundStep.id]: backgroundStep,
        [example1When.id]: example1When,
        [example1Then.id]: example1Then,
        [example2When.id]: example2When,
        [example2Then.id]: example2Then,
      })
    })

    it('works for a Background and Rule with its own Background and Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithBackgroundAndExamples()

      // Act
      const output = getGherkinStepMap(gherkinDocument)

      // Assert
      const featureBackgroundStep =
        gherkinDocument.feature.children[0].background.steps[0]
      const ruleBackgroundStep =
        gherkinDocument.feature.children[1].rule.children[0].background.steps[0]
      const example1When =
        gherkinDocument.feature.children[1].rule.children[1].scenario.steps[0]
      const example1Then =
        gherkinDocument.feature.children[1].rule.children[1].scenario.steps[1]
      const example2When =
        gherkinDocument.feature.children[1].rule.children[2].scenario.steps[0]
      const example2Then =
        gherkinDocument.feature.children[1].rule.children[2].scenario.steps[1]
      expect(output).to.eql({
        [featureBackgroundStep.id]: featureBackgroundStep,
        [ruleBackgroundStep.id]: ruleBackgroundStep,
        [example1When.id]: example1When,
        [example1Then.id]: example1Then,
        [example2When.id]: example2When,
        [example2Then.id]: example2Then,
      })
    })
  })

  describe('getGherkinScenarioMap', () => {
    it('works for a Background and Scenario', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenario()

      // Act
      const output = getGherkinScenarioMap(gherkinDocument)

      // Assert
      const scenario = gherkinDocument.feature.children[1].scenario
      expect(output).to.eql({
        [scenario.id]: scenario,
      })
    })

    it('works for a Background and Scenario Outline', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenarioOutline()

      // Act
      const output = getGherkinScenarioMap(gherkinDocument)

      // Assert
      const scenario = gherkinDocument.feature.children[1].scenario
      expect(output).to.eql({
        [scenario.id]: scenario,
      })
    })

    it('works for a Background and Rule with Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithExamples()

      // Act
      const output = getGherkinScenarioMap(gherkinDocument)

      // Assert
      const example1 =
        gherkinDocument.feature.children[1].rule.children[0].scenario
      const example2 =
        gherkinDocument.feature.children[1].rule.children[1].scenario
      expect(output).to.eql({
        [example1.id]: example1,
        [example2.id]: example2,
      })
    })

    it('works for a Background and Rule with its own Background and Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithBackgroundAndExamples()

      // Act
      const output = getGherkinScenarioMap(gherkinDocument)

      // Assert
      const example1 =
        gherkinDocument.feature.children[1].rule.children[1].scenario
      const example2 =
        gherkinDocument.feature.children[1].rule.children[2].scenario
      expect(output).to.eql({
        [example1.id]: example1,
        [example2.id]: example2,
      })
    })
  })

  describe('getGherkinExampleRuleMap', () => {
    it('works for a Background and Scenario', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenario()

      // Act
      const output = await getGherkinExampleRuleMap(gherkinDocument)

      // Assert
      expect(output).to.eql({})
    })

    it('works for a Background and Scenario Outline', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenarioOutline()

      // Act
      const output = await getGherkinExampleRuleMap(gherkinDocument)

      // Assert
      expect(output).to.eql({})
    })

    it('works for a Background and Rule with Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithExamples()

      // Act
      const output = await getGherkinExampleRuleMap(gherkinDocument)

      // Assert
      const rule = gherkinDocument.feature.children[1].rule
      const example1 = rule.children[0].scenario
      const example2 = rule.children[1].scenario
      expect(output).to.eql({
        [example1.id]: rule,
        [example2.id]: rule,
      })
    })

    it('works for a Background and Rule with its own Background and Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithBackgroundAndExamples()

      // Act
      const output = await getGherkinExampleRuleMap(gherkinDocument)

      // Assert
      const rule = gherkinDocument.feature.children[1].rule
      const example1 = rule.children[1].scenario
      const example2 = rule.children[2].scenario
      expect(output).to.eql({
        [example1.id]: rule,
        [example2.id]: rule,
      })
    })
  })

  describe('getGherkinScenarioLocationMap', () => {
    it('works for a Background and Scenario', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenario()

      // Act
      const output = await getGherkinScenarioLocationMap(gherkinDocument)

      // Assert
      const scenario = gherkinDocument.feature.children[1].scenario
      expect(output).to.eql({
        [scenario.id]: scenario.location,
      })
    })

    it('works for a Background and Scenario Outline', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndScenarioOutline()

      // Act
      const output = await getGherkinScenarioLocationMap(gherkinDocument)

      // Assert
      const scenario = gherkinDocument.feature.children[1].scenario
      const row1 = scenario.examples[0].tableBody[0]
      const row2 = scenario.examples[0].tableBody[1]
      expect(output).to.eql({
        [scenario.id]: scenario.location,
        [row1.id]: row1.location,
        [row2.id]: row2.location,
      })
    })

    it('works for a Background and Rule with Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithExamples()

      // Act
      const output = await getGherkinScenarioLocationMap(gherkinDocument)

      // Assert
      const example1 =
        gherkinDocument.feature.children[1].rule.children[0].scenario
      const example2 =
        gherkinDocument.feature.children[1].rule.children[1].scenario
      expect(output).to.eql({
        [example1.id]: example1.location,
        [example2.id]: example2.location,
      })
    })

    it('works for a Background and Rule with its own Background and Examples', async () => {
      // Arrange
      const gherkinDocument = await withBackgroundAndRuleWithBackgroundAndExamples()

      // Act
      const output = await getGherkinScenarioLocationMap(gherkinDocument)

      // Assert
      const example1 =
        gherkinDocument.feature.children[1].rule.children[1].scenario
      const example2 =
        gherkinDocument.feature.children[1].rule.children[2].scenario
      expect(output).to.eql({
        [example1.id]: example1.location,
        [example2.id]: example2.location,
      })
    })
  })
})

async function parseGherkinDocument(data: string): Promise<IGherkinDocument> {
  const parsed: IParsedSourceWithEnvelopes = await parse({
    data,
    uri: 'features/a.feature',
  })
  return parsed.gherkinDocument
}

async function withBackgroundAndScenario(): Promise<IGherkinDocument> {
  return await parseGherkinDocument(`\
Feature: a feature
  Background:
    Given a setup step

  Scenario:
    When a regular step
`)
}

async function withBackgroundAndScenarioOutline(): Promise<IGherkinDocument> {
  return await parseGherkinDocument(`\
Feature: a feature
  Background:
    Given a setup step

  Scenario Outline:
    When a templated step with <word>
  Examples:
    | word |
    | foo  |
    | bar  |
`)
}

async function withBackgroundAndRuleWithExamples(): Promise<IGherkinDocument> {
  return await parseGherkinDocument(`\
Feature: a feature
  Background:
    Given a setup step

  Rule: a rule
    Example: an example
      When a regular step
      Then an assertion
    
    Example: another example
      When a regular step
      Then an assertion
`)
}

async function withBackgroundAndRuleWithBackgroundAndExamples(): Promise<IGherkinDocument> {
  return await parseGherkinDocument(`\
Feature: a feature
  Background:
    Given a feature-level setup step

  Rule: a rule
    Background:
      Given a rule-level setup step
      
    Example: an example
      When a regular step
      Then an assertion
    
    Example: another example
      When a regular step
      Then an assertion
`)
}
