import { ParameterType } from '@cucumber/cucumber-expressions'
import type { IParameterTypeDefinition } from './types'

export function buildParameterType({
  name,
  regexp,
  transformer,
  useForSnippets,
  preferForRegexpMatch,
  // biome-ignore lint/suspicious/noExplicitAny: the transformer returns whatever type the user's parameter type produces
}: IParameterTypeDefinition<any>): ParameterType<any> {
  if (typeof useForSnippets !== 'boolean') {
    useForSnippets = true
  }
  if (typeof preferForRegexpMatch !== 'boolean') {
    preferForRegexpMatch = false
  }
  return new ParameterType(name, regexp, null, transformer, useForSnippets, preferForRegexpMatch)
}
