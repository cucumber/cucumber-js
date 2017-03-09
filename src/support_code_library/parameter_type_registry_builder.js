import {ParameterType, ParameterTypeRegistry} from 'cucumber-expressions'

function build() {
  const parameterTypeRegistry = new ParameterTypeRegistry()
  const stringInDoubleQuotesParameterType = new ParameterType(
    'stringInDoubleQuotes',
    function() {},
    '"[^"]*"',
    JSON.parse
  )
  parameterTypeRegistry.defineParameterType(stringInDoubleQuotesParameterType)
  return parameterTypeRegistry
}

export default {build}
