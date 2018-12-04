import _ from 'lodash'
import arity from 'util-arity'
import isGenerator from 'is-generator'
import path from 'path'

export function wrapDefinitions({
  cwd,
  definitionFunctionWrapper,
  definitions,
}) {
  if (definitionFunctionWrapper) {
    definitions.forEach(definition => {
      const codeLength = definition.code.length
      const wrappedFn = definitionFunctionWrapper(
        definition.code,
        definition.options.wrapperOptions
      )
      if (wrappedFn !== definition.code) {
        definition.code = arity(codeLength, wrappedFn)
      }
    })
  } else {
    const generatorDefinitions = _.filter(definitions, definition =>
      isGenerator.fn(definition.code)
    )
    if (generatorDefinitions.length > 0) {
      const references = generatorDefinitions
        .map(
          definition =>
            `${path.relative(cwd, definition.uri)}:${definition.line}`
        )
        .join('\n  ')
      const message = `
        The following hook/step definitions use generator functions:

          ${references}

        Use 'this.setDefinitionFunctionWrapper(fn)' to wrap them in a function that returns a promise.
        `
      throw new Error(message)
    }
  }
}
