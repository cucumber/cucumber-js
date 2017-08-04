import _ from 'lodash'
import Gherkin from 'gherkin'

const types = {
  EVENT: 'event',
  OUTCOME: 'outcome',
  PRECONDITION: 'precondition'
}

export default types

export function getStepKeywordType({ keyword, language, previousKeywordType }) {
  const dialect = Gherkin.DIALECTS[language]
  const type = _.find(['given', 'when', 'then', 'and', 'but'], key => {
    return _.includes(dialect[key], keyword)
  })
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
