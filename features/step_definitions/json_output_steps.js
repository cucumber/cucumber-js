/* eslint-disable babel/new-cap */

import _ from 'lodash'
import { Then } from '../../'
import { expect } from 'chai'
import {
  getScenarioNames,
  getSteps,
  findScenario,
  findStep,
} from '../support/json_output_helpers'

Then(/^it runs (\d+) scenarios$/, function(count) {
  expect(this.lastRun.jsonOutput[0].elements.length).to.eql(count)
})

Then(/^it runs the scenario "([^"]*)"$/, function(name) {
  const actualNames = getScenarioNames(this.lastRun.jsonOutput)
  expect(actualNames).to.eql([name])
})

Then(/^it runs the scenarios "([^"]*)" and "([^"]*)"$/, function(name1, name2) {
  const actualNames = getScenarioNames(this.lastRun.jsonOutput)
  expect(actualNames).to.eql([name1, name2])
})

Then(/^it runs the scenarios:$/, function(table) {
  const expectedNames = table.rows().map(row => row[0])
  const actualNames = getScenarioNames(this.lastRun.jsonOutput)
  expect(expectedNames).to.eql(actualNames)
})

Then(/^the scenario "([^"]*)" has the steps$/, function(name, table) {
  const scenario = findScenario({
    features: this.lastRun.jsonOutput,
    scenarioPredicate: ['name', name],
  })
  const expectedNames = table.rows().map(row => row[0])
  const actualNames = scenario.steps.map(step =>
    _.compact([step.keyword, step.name]).join('')
  )
  expect(actualNames).to.eql(expectedNames)
})

Then(/^the step "([^"]*)" failed with:$/, function(name, errorMessage) {
  const step = findStep({
    features: this.lastRun.jsonOutput,
    stepPredicate: ['name', name],
  })
  expect(step.result.status).to.eql('failed')
  expect(step.result.error_message).to.include(errorMessage)
})

Then(/^all steps have status "([^"]*)"$/, function(status) {
  const steps = getSteps(this.lastRun.jsonOutput)
  const stepStatues = _.chain(steps)
    .map(step => step.result.status)
    .uniq()
    .value()
  expect(stepStatues.length).to.eql(1)
  expect(stepStatues[0]).to.eql(status)
})

Then(/^the step "([^"]*)" has status "([^"]*)"$/, function(name, status) {
  const step = findStep({
    features: this.lastRun.jsonOutput,
    stepPredicate: ['name', name],
  })
  expect(step.result.status).to.eql(status)
})

Then(/^the "([^"]*)" hook has status "([^"]*)"$/, function(keyword, status) {
  const step = findStep({
    features: this.lastRun.jsonOutput,
    stepPredicate: ['keyword', keyword],
  })
  expect(step.result.status).to.eql(status)
})

Then('the step {string} has the attachment', function(name, table) {
  const step = findStep({
    features: this.lastRun.jsonOutput,
    stepPredicate: ['name', name],
  })
  const tableRowData = table.hashes()[0]
  const expectedAttachment = {
    data: tableRowData.DATA,
    mime_type: tableRowData['MIME TYPE'],
  }
  expect(step.embeddings[0]).to.eql(expectedAttachment)
})

Then('the {string} hook has the attachment', function(keyword, table) {
  const hook = findStep({
    features: this.lastRun.jsonOutput,
    stepPredicate: ['keyword', keyword],
  })
  const tableRowData = table.hashes()[0]
  const expectedAttachment = {
    data: tableRowData.DATA,
    mime_type: tableRowData['MIME TYPE'],
  }
  expect(hook.embeddings[0]).to.eql(expectedAttachment)
})

Then(/^the (first|second) scenario has the steps$/, function(cardinal, table) {
  const scenarioIndex = cardinal === 'first' ? 0 : 1
  const scenario = findScenario({
    features: this.lastRun.jsonOutput,
    scenarioPredicate: (element, index) => index === scenarioIndex,
  })
  const stepNames = scenario.steps.map(step => [step.name])
  expect(stepNames).to.eql(table.rows())
})

Then(
  /^the (first|second) scenario has the step "([^"]*)" with the doc string$/,
  function(cardinal, name, docString) {
    const scenarioIndex = cardinal === 'first' ? 0 : 1
    const step = findStep({
      features: this.lastRun.jsonOutput,
      scenarioPredicate(element, index) {
        return index === scenarioIndex
      },
      stepPredicate: ['name', name],
    })
    expect(step.arguments[0].content).to.eql(docString)
  }
)

Then(
  /^the (first|second) scenario has the step "([^"]*)" with the table$/,
  function(cardinal, name, table) {
    const scenarioIndex = cardinal === 'first' ? 0 : 1
    const step = findStep({
      features: this.lastRun.jsonOutput,
      scenarioPredicate(element, index) {
        return index === scenarioIndex
      },
      stepPredicate: ['name', name],
    })
    const expected = table.raw().map(row => ({ cells: row }))
    expect(step.arguments[0].rows).to.eql(expected)
  }
)

Then(/^the (first|second) scenario has the name "([^"]*)"$/, function(
  cardinal,
  name
) {
  const scenarioIndex = cardinal === 'first' ? 0 : 1
  const scenario = findScenario({
    features: this.lastRun.jsonOutput,
    scenarioPredicate(element, index) {
      return index === scenarioIndex
    },
  })
  expect(scenario.name).to.eql(name)
})
