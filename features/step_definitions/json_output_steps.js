/* eslint-disable babel/new-cap */

import _ from 'lodash'
import {defineSupportCode} from '../../'
import {getAdditionalErrorText, normalizeText} from '../support/helpers'
import assert from 'assert'
import {getScenarioNames, getSteps, findScenario, findStep} from '../support/json_output_helpers'

defineSupportCode(({Then}) => {
  Then(/^it runs (\d+) scenarios$/, function(count) {
    assert.equal(this.lastRun.jsonOutput[0].elements.length, count)
  })

  Then(/^it runs the scenario "([^"]*)"$/, function (name) {
    const actualNames = getScenarioNames(this.lastRun.jsonOutput)
    assert.deepEqual(actualNames, [name])
  })

  Then(/^it runs the scenarios "([^"]*)" and "([^"]*)"$/, function (name1, name2) {
    const actualNames = getScenarioNames(this.lastRun.jsonOutput)
    assert.deepEqual(actualNames, [name1, name2])
  })

  Then(/^it runs the scenarios:$/, function (table) {
    const expectedNames = table.rows().map((row) => row[0])
    const actualNames = getScenarioNames(this.lastRun.jsonOutput)
    assert.deepEqual(expectedNames, actualNames)
  })

  Then(/^the scenario "([^"]*)" has the steps$/, function (name, table) {
    const scenario = findScenario(this.lastRun.jsonOutput, function(element) {
      return element.name === name
    })
    const expectedNames = table.rows().map((row) => row[0])
    const actualNames = scenario.steps.map(function(step){
      return _.compact([step.keyword, step.name]).join('')
    })
    assert.deepEqual(actualNames, expectedNames)
  })

  Then(/^the step "([^"]*)" failed with:$/, function (name, errorMessage) {
    const step = findStep(this.lastRun.jsonOutput, _.identity, ['name', name])
    assert.equal(step.result.status, 'failed')
    if (errorMessage && step.result.error_message.indexOf(errorMessage) === -1) {
      throw new Error('Expected "' + name + '" to have an error_message containing "' +
                      errorMessage + '"\n' + 'Got:\n' + step.result.error_message)
    }
  })

  Then(/^all steps have status "([^"]*)"$/, function (status) {
    const steps = getSteps(this.lastRun.jsonOutput)
    const stepStatues = _.chain(steps).map((step) => step.result.status).uniq().value()
    assert.equal(stepStatues.length, 1)
    assert.equal(stepStatues[0], status)
  })

  Then(/^the step "([^"]*)" has status "([^"]*)"$/, function (name, status) {
    const step = findStep(this.lastRun.jsonOutput, _.identity, ['name', name])
    assert.equal(step.result.status, status)
  })

  Then(/^the "([^"]*)" hook has status "([^"]*)"$/, function (keyword, status) {
    const step = findStep(this.lastRun.jsonOutput, _.identity, ['keyword', keyword])
    assert.equal(step.result.status, status)
  })

  Then('the step {arg1:stringInDoubleQuotes} has the attachment', function (name, table) {
    const step = findStep(this.lastRun.jsonOutput, _.identity, ['name', name])
    const attachment = _.mapKeys(table.hashes()[0], (v, k) => _.snakeCase(k))
    assert.deepEqual(step.embeddings[0], attachment)
  })

  Then('the {arg1:stringInDoubleQuotes} hook has the attachment', function (keyword, table) {
    const hook = findStep(this.lastRun.jsonOutput, _.identity, ['keyword', keyword])
    const attachment = _.mapKeys(table.hashes()[0], (v, k) => _.snakeCase(k))
    assert.deepEqual(hook.embeddings[0], attachment)
  })

  Then(/^the (first|second) scenario has the steps$/, function (cardinal, table) {
    const scenarioIndex = cardinal === 'first' ? 0 : 1
    const scenario = findScenario(this.lastRun.jsonOutput, function(element, index) {
      return index === scenarioIndex
    })
    const stepNames = scenario.steps.map(function(step){
      return [step.name]
    })
    assert.deepEqual(stepNames, table.rows())
  })

  Then(/^the (first|second) scenario has the step "([^"]*)" with the doc string$/, function (cardinal, name, docString) {
    const scenarioIndex = cardinal === 'first' ? 0 : 1
    const step = findStep(this.lastRun.jsonOutput, function(element, index){
      return index === scenarioIndex
    }, ['name', name])
    assert.equal(step.arguments[0].content, docString)
  })

  Then(/^the (first|second) scenario has the step "([^"]*)" with the table$/, function (cardinal, name, table) {
    const scenarioIndex = cardinal === 'first' ? 0 : 1
    const step = findStep(this.lastRun.jsonOutput, function(element, index){
      return index === scenarioIndex
    }, ['name', name])
    const expected = table.raw().map(function (row) {
      return {cells: row}
    })
    assert.deepEqual(step.arguments[0].rows, expected)
  })

  Then(/^the (first|second) scenario has the name "([^"]*)"$/, function (cardinal, name) {
    const scenarioIndex = cardinal === 'first' ? 0 : 1
    const scenario = findScenario(this.lastRun.jsonOutput, function(element, index) {
      return index === scenarioIndex
    })
    assert.equal(scenario.name, name)
  })
})
