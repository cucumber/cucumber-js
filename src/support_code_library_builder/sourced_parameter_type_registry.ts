import {
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
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
