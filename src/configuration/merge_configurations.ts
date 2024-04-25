import mergeWith from 'lodash.mergewith'
import { IConfiguration } from './types'

const ADDITIVE_ARRAYS = [
  'format',
  'import',
  'loader',
  'name',
  'paths',
  'require',
  'requireModule',
]
const TAG_EXPRESSIONS = ['tags', 'retryTagFilter']

function mergeArrays(objValue: any[], srcValue: any[]) {
  if (objValue && srcValue) {
    return [].concat(objValue, srcValue)
  }
  return undefined
}

function mergeTagExpressions(objValue: string, srcValue: string) {
  if (objValue && srcValue) {
    return `${wrapTagExpression(objValue)} and ${wrapTagExpression(srcValue)}`
  }
  return undefined
}

function wrapTagExpression(raw: string) {
  if (raw.startsWith('(') && raw.endsWith(')')) {
    return raw
  }
  return `(${raw})`
}

function customizer(objValue: any, srcValue: any, key: string): any {
  if (ADDITIVE_ARRAYS.includes(key)) {
    return mergeArrays(objValue, srcValue)
  }
  if (TAG_EXPRESSIONS.includes(key)) {
    return mergeTagExpressions(objValue, srcValue)
  }
  return undefined
}

export function mergeConfigurations<T = Partial<IConfiguration>>(
  source: T,
  ...configurations: Partial<IConfiguration>[]
): T {
  return mergeWith({}, source, ...configurations, customizer)
}
