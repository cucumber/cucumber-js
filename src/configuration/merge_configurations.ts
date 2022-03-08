import { IConfiguration } from './types'
import mergeWith from 'lodash.mergewith'

const MERGEABLE_ARRAYS = [
  'format',
  'import',
  'name',
  'paths',
  'require',
  'requireModule',
]

function mergeArrays(objValue: any[], srcValue: any[]) {
  return [].concat(objValue, srcValue).filter((item) => item !== undefined)
}

function customizer(objValue: any, srcValue: any, key: any): any {
  if (MERGEABLE_ARRAYS.includes(key)) {
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
