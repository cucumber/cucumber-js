import { IConfiguration } from './types'
import mergeWith from 'lodash.mergewith'

function mergeArrays(objValue: any[], srcValue: any[]) {
  return [].concat(objValue, srcValue).filter((item) => item !== undefined)
}

function customizer(objValue: any, srcValue: any, key: any): any {
  // TODO others too!
  if (key === 'paths') {
    return mergeArrays(objValue, srcValue)
  }
  return undefined
}

export function mergeConfigurations<T = Partial<IConfiguration>>(
  source: T,
  ...configurations: Partial<IConfiguration>[]
): T {
  return mergeWith({}, source, ...configurations, customizer)
}
