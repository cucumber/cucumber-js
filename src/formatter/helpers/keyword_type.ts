import _ from 'lodash'
import Gherkin from 'gherkin'
import { doesHaveValue } from '../../value_checker'

export enum KeywordType {
  Precondition = 'precondition',
  Event = 'event',
  Outcome = 'outcome',
}

export interface IGetStepKeywordTypeOptions {
  keyword: string
  language: string
  previousKeywordType?: KeywordType
}

export function getStepKeywordType({
  keyword,
  language,
  previousKeywordType,
}: IGetStepKeywordTypeOptions): KeywordType {
  const dialect = Gherkin.dialects()[language]
  const type = _.find(['given', 'when', 'then', 'and', 'but'], key =>
    _.includes(dialect[key], keyword)
  )
  switch (type) {
    case 'when':
      return KeywordType.Event
    case 'then':
      return KeywordType.Outcome
    case 'and':
    case 'but':
      if (doesHaveValue(previousKeywordType)) {
        return previousKeywordType
      }
    // fallthrough
    default:
      return KeywordType.Precondition
  }
}
