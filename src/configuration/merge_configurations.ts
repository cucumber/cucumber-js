import { IConfiguration } from './types'
import mergeWith from 'lodash.mergewith'

function mergeArrays(objValue: any[], srcValue: any[]) {
  return [].concat(objValue, srcValue).filter((item) => item !== undefined)
}

function customizer(objValue: any, srcValue: any, key: any): any {
  if (key === 'paths') {
    return mergeArrays(objValue, srcValue)
  }
  return undefined
}

export function mergeConfigurations(
  ...configurations: Partial<IConfiguration>[]
): Partial<IConfiguration> {
  return mergeWith({}, ...configurations, customizer)
}
