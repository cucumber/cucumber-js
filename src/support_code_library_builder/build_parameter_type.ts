import { ParameterType } from '@cucumber/cucumber-expressions'
import { IParameterTypeDefinition } from './types'

export function buildParameterType({
  name,
  regexp,
  transformer,
  useForSnippets,
  preferForRegexpMatch,
}: IParameterTypeDefinition<any>): ParameterType<any> {
  if (typeof useForSnippets !== 'boolean') useForSnippets = true
  if (typeof preferForRegexpMatch !== 'boolean') preferForRegexpMatch = false
  return new ParameterType(
    name,
    regexp,
    null,
    transformer,
    useForSnippets,
    preferForRegexpMatch
  )
}
