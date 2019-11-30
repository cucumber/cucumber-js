import _ from 'lodash'
import path from 'path'
import parse from 'cucumber-tag-expressions'

const FEATURE_LINENUM_REGEXP = /^(.*?)((?::[\d]+)+)?$/

export default class PickleFilter {
  constructor({ cwd, featurePaths, names, tagExpression }) {
    this.featureUriToLinesMapping = this.getFeatureUriToLinesMapping({
      cwd,
      featurePaths: featurePaths || [],
    })
    this.names = names || []
    if (tagExpression) {
      this.tagExpressionNode = parse(tagExpression || '')
    }
  }

  getFeatureUriToLinesMapping({ cwd, featurePaths }) {
    const mapping = {}
    featurePaths.forEach(featurePath => {
      const match = FEATURE_LINENUM_REGEXP.exec(featurePath)
      if (match) {
        const uri = path.resolve(cwd, match[1])
        const linesExpression = match[2]
        if (linesExpression) {
          if (!mapping[uri]) {
            mapping[uri] = []
          }
          linesExpression
            .slice(1)
            .split(':')
            .forEach(line => {
              mapping[uri].push(parseInt(line))
            })
        }
      }
    })
    return mapping
  }

  matches(pickle, cwd) {
    return (
      this.matchesAnyLine(pickle, cwd) &&
      this.matchesAnyName(pickle) &&
      this.matchesAllTagExpressions(pickle)
    )
  }

  matchesAnyLine(pickle) {
    // TODO need the gherkin document to lookup the line
    const lines = this.featureUriToLinesMapping[pickle.uri]
    if (lines) {
      return _.size(_.intersection(lines, _.map(pickle.locations, 'line'))) > 0
    }
    return true
  }

  matchesAnyName(pickle) {
    if (this.names.length === 0) {
      return true
    }
    return _.some(this.names, name => pickle.name.match(name))
  }

  matchesAllTagExpressions(pickle) {
    if (!this.tagExpressionNode) {
      return true
    }
    return this.tagExpressionNode.evaluate(_.map(pickle.tags, 'name'))
  }
}
