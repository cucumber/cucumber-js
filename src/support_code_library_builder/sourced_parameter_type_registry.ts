import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import ParameterType from '@cucumber/cucumber-expressions/dist/cjs/src/ParameterType'
import { ILineAndUri } from '../types'

export class SourcedParameterTypeRegistry extends ParameterTypeRegistry {
  private parameterTypeToSource: WeakMap<ParameterType<unknown>, ILineAndUri> =
    new WeakMap()

  defineSourcedParameterType(
    parameterType: ParameterType<unknown>,
    source: ILineAndUri
  ) {
    this.defineParameterType(parameterType)
    this.parameterTypeToSource.set(parameterType, source)
  }

  lookupSource(parameterType: ParameterType<unknown>) {
    return this.parameterTypeToSource.get(parameterType)
  }
}
