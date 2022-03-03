import { IConfiguration } from './types'
import mergeWith from 'lodash.mergewith'

function mergeArrays(objValue: any[], srcValue: any[]) {
  if (Array.isArray(objValue) || Array.isArray(srcValue)) {
    let merged: any[] = []
    if (Array.isArray(objValue)) {
      merged = merged.concat(objValue)
    }
    if (Array.isArray(srcValue)) {
      merged = merged.concat(srcValue)
    }
    return merged
  }
  return undefined
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
