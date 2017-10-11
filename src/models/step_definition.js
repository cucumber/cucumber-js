import { CucumberExpression, RegularExpression } from 'cucumber-expressions'
import DataTable from './data_table'
import { buildStepArgumentIterator } from '../step_arguments'

export default class StepDefinition {
  constructor({ code, line, options, pattern, uri }) {
    this.code = code
    this.line = line
    this.options = options
    this.pattern = pattern
    this.uri = uri
  }

  buildInvalidCodeLengthMessage(syncOrPromiseLength, callbackLength) {
    return (
      'function has ' +
      this.code.length +
      ' arguments' +
      ', should have ' +
      syncOrPromiseLength +
      ' (if synchronous or returning a promise)' +
      ' or ' +
      callbackLength +
      ' (if accepting a callback)'
    )
  }

  getInvalidCodeLengthMessage(parameters) {
    return this.buildInvalidCodeLengthMessage(
      parameters.length,
      parameters.length + 1
    )
  }

  getInvocationParameters({ step, parameterTypeRegistry, world }) {
    const cucumberExpression = this.getCucumberExpression(parameterTypeRegistry)
    const stepNameParameters = cucumberExpression
      .match(step.text)
      .map(arg => arg.getValue(world))
    const iterator = buildStepArgumentIterator({
      dataTable: arg => new DataTable(arg),
      docString: arg => arg.content
    })
    const stepArgumentParameters = step.arguments.map(iterator)
    return stepNameParameters.concat(stepArgumentParameters)
  }

  getCucumberExpression(parameterTypeRegistry) {
    if (typeof this.pattern === 'string') {
      return new CucumberExpression(this.pattern, parameterTypeRegistry)
    } else {
      return new RegularExpression(this.pattern, parameterTypeRegistry)
    }
  }

  getValidCodeLengths(parameters) {
    return [parameters.length, parameters.length + 1]
  }

  matchesStepName({ stepName, parameterTypeRegistry }) {
    const cucumberExpression = this.getCucumberExpression(parameterTypeRegistry)
    return Boolean(cucumberExpression.match(stepName))
  }
}
