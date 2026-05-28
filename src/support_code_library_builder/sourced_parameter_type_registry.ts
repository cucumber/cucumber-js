import {
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import { ILineAndUri } from '../types'

export class SourcedParameterTypeRegistry extends ParameterTypeRegistry {
  private parameterTypeToSource: WeakMap<
    ParameterType<unknown>,
    ILineAndUri & { order: number }
  > = new WeakMap()

  defineSourcedParameterType(
    parameterType: ParameterType<unknown>,
    source: ILineAndUri,
    order: number
  ) {
    this.defineParameterType(parameterType)
    this.parameterTypeToSource.set(parameterType, { ...source, order })
  }

  lookupSource(parameterType: ParameterType<unknown>) {
    return this.parameterTypeToSource.get(parameterType)
  }
}
