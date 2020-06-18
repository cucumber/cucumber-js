import _ from 'lodash'
import Gherkin from 'gherkin'
import { doesHaveValue } from '../../value_checker'
import Dialect from 'gherkin/dist/src/Dialect'

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
  const dialect: Dialect = Gherkin.dialects()[language]
  const stepKeywords = ['given', 'when', 'then', 'and', 'but'] as const
  const type = _.find(stepKeywords, (key) => _.includes(dialect[key], keyword))
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
