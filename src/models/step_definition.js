import _ from 'lodash'
import {CucumberExpression, RegularExpression} from 'cucumber-expressions'
import DataTable from './step_arguments/data_table'
import DocString from './step_arguments/doc_string'

export default class StepDefinition {
  constructor({code, line, options, pattern, uri}) {
    this.code = code
    this.line = line
    this.options = options
    this.pattern = pattern
    this.uri = uri
  }

  buildInvalidCodeLengthMessage(syncOrPromiseLength, callbackLength) {
    return 'function has ' + this.code.length + ' arguments' +
      ', should have ' + syncOrPromiseLength + ' (if synchronous or returning a promise)' +
      ' or '  + callbackLength + ' (if accepting a callback)'
  }

  getInvalidCodeLengthMessage(parameters) {
    return this.buildInvalidCodeLengthMessage(parameters.length, parameters.length + 1)
  }

  getInvocationParameters({step, parameterTypeRegistry}) {
    const cucumberExpression = this.getCucumberExpression(parameterTypeRegistry)
    const stepNameParameters = _.map(cucumberExpression.match(step.name), 'value')
    const stepArgumentParameters = step.arguments.map(function(arg) {
      if (arg instanceof DataTable) {
        return arg
      } else if (arg instanceof DocString) {
        return arg.content
      } else {
        throw new Error('Unknown argument type:' + arg)
      }
    })
    return stepNameParameters.concat(stepArgumentParameters)
  }

  getCucumberExpression(parameterTypeRegistry) {
    if (typeof(this.pattern) === 'string') {
      return new CucumberExpression(this.pattern, parameterTypeRegistry)
    } else {
      return new RegularExpression(this.pattern, parameterTypeRegistry)
    }
  }

  getValidCodeLengths(parameters) {
    return [parameters.length, parameters.length + 1]
  }

  matchesStepName({stepName, parameterTypeRegistry}) {
    const cucumberExpression = this.getCucumberExpression(parameterTypeRegistry)
    return Boolean(cucumberExpression.match(stepName))
  }
}
