import isGenerator from 'is-generator'
import path from 'path'

export interface IDefinitionConfig {
  code: any
  line: number
  uri: string
}

export interface IValidateNoGeneratorFunctionsRequest {
  cwd: string
  definitionConfigs: IDefinitionConfig[]
}

export function validateNoGeneratorFunctions({
  cwd,
  definitionConfigs,
}: IValidateNoGeneratorFunctionsRequest): void {
  const generatorDefinitionConfigs = definitionConfigs.filter(
    definitionConfig => isGenerator.fn(definitionConfig.code)
  )
  if (generatorDefinitionConfigs.length > 0) {
    const references = generatorDefinitionConfigs
      .map(
        definitionConfig =>
          `${path.relative(
            cwd,
            definitionConfig.uri
          )}:${definitionConfig.line.toString()}`
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
