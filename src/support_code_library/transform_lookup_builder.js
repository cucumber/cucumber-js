import {Parameter, ParameterRegistry} from 'cucumber-expressions'

function build() {
  const parameterRegistry = new ParameterRegistry()
  const stringInDoubleQuotesParameter = new Parameter(
    'stringInDoubleQuotes',
    function() {},
    '"[^"]*"',
    JSON.parse
  )
  parameterRegistry.addParameter(stringInDoubleQuotesParameter)
  return parameterRegistry
}

export default {build}
