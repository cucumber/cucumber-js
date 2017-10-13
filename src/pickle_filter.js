import _ from 'lodash'
import { TagExpressionParser } from 'cucumber-tag-expressions'

const FEATURE_LINENUM_REGEXP = /^(.*?)((?::[\d]+)+)?$/
const tagExpressionParser = new TagExpressionParser()

export default class PickleFilter {
  constructor({ featurePaths, names, tagExpression }) {
    this.featureUriToLinesMapping = this.getFeatureUriToLinesMapping(
      featurePaths || []
    )
    this.names = names || []
    if (tagExpression) {
      this.tagExpressionNode = tagExpressionParser.parse(tagExpression || '')
    }
  }

  getFeatureUriToLinesMapping(featurePaths) {
    const mapping = {}
    featurePaths.forEach(featurePath => {
      const match = FEATURE_LINENUM_REGEXP.exec(featurePath)
      if (match) {
        const uri = match[1]
        const linesExpression = match[2]
        if (linesExpression) {
          if (!mapping[uri]) {
            mapping[uri] = []
          }
          linesExpression
            .slice(1)
            .split(':')
            .forEach(function(line) {
              mapping[uri].push(parseInt(line))
            })
        }
      }
    })
    return mapping
  }

  matches({ pickle, uri }) {
    return (
      this.matchesAnyLine({ pickle, uri }) &&
      this.matchesAnyName(pickle) &&
      this.matchesAllTagExpressions(pickle)
    )
  }

  matchesAnyLine({ pickle, uri }) {
    const lines = this.featureUriToLinesMapping[uri]
    if (lines) {
      return _.size(_.intersection(lines, _.map(pickle.locations, 'line'))) > 0
    } else {
      return true
    }
  }

  matchesAnyName(pickle) {
    if (this.names.length === 0) {
      return true
    }
    return _.some(this.names, function(name) {
      return pickle.name.match(name)
    })
  }

  matchesAllTagExpressions(pickle) {
    if (!this.tagExpressionNode) {
      return true
    }
    return this.tagExpressionNode.evaluate(_.map(pickle.tags, 'name'))
  }
}
