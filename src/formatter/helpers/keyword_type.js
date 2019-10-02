import _ from 'lodash'
import { dialects } from 'gherkin'

const types = {
  EVENT: 'event',
  OUTCOME: 'outcome',
  PRECONDITION: 'precondition',
}

export default types

export function getStepKeywordType({ keyword, language, previousKeywordType }) {
  const dialect = dialects()[language]
  const type = _.find(['given', 'when', 'then', 'and', 'but'], key =>
    _.includes(dialect[key], keyword)
  )
  switch (type) {
    case 'when':
      return types.EVENT
    case 'then':
      return types.OUTCOME
    case 'and':
    case 'but':
      if (previousKeywordType) {
        return previousKeywordType
      }
    // fallthrough
    default:
      return types.PRECONDITION
  }
}
