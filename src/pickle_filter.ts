import _, { Dictionary } from 'lodash'
import path from 'path'
import parse from 'cucumber-tag-expressions'
import { getGherkinScenarioLocationMap } from './formatter/helpers/gherkin_document_parser'
import { messages } from 'cucumber-messages'

const FEATURE_LINENUM_REGEXP = /^(.*?)((?::[\d]+)+)?$/

export interface IPickleFilterOptions {
  cwd: string
  featurePaths?: string[]
  names?: string[]
  tagExpression?: string
}

export default class PickleFilter {
  private readonly lineFilter: PickleLineFilter
  private readonly nameFilter: PickleNameFilter
  private readonly tagFilter: PickleTagFilter

  constructor({
    cwd,
    featurePaths,
    names,
    tagExpression,
  }: IPickleFilterOptions) {
    this.lineFilter = new PickleLineFilter(cwd, featurePaths)
    this.nameFilter = new PickleNameFilter(names)
    this.tagFilter = new PickleTagFilter(tagExpression)
  }

  matches({ gherkinDocument, pickle }): boolean {
    return (
      this.lineFilter.matchesAnyLine({ gherkinDocument, pickle }) &&
      this.nameFilter.matchesAnyName(pickle) &&
      this.tagFilter.matchesAllTagExpressions(pickle)
    )
  }
}

export class PickleLineFilter {
  private readonly featureUriToLinesMapping: Dictionary<number[]>

  constructor(cwd, featurePaths) {
    this.featureUriToLinesMapping = this.getFeatureUriToLinesMapping({
      cwd,
      featurePaths: featurePaths || [],
    })
  }

  getFeatureUriToLinesMapping({ cwd, featurePaths }): Dictionary<number[]> {
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

  matchesAnyLine({ gherkinDocument, pickle }) {
    const linesToMatch = this.featureUriToLinesMapping[pickle.uri]
    if (linesToMatch) {
      const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
        gherkinDocument
      )
      const pickleLines = pickle.astNodeIds.map(
        sourceId => gherkinScenarioLocationMap[sourceId].line
      )
      return _.size(_.intersection(linesToMatch, pickleLines)) > 0
    }
    return true
  }
}

export class PickleNameFilter {
  private readonly names: string[]

  constructor(names: string[]) {
    this.names = names || []
  }

  matchesAnyName(pickle: messages.IPickle): boolean {
    if (this.names.length === 0) {
      return true
    }
    return _.some(this.names, name => pickle.name.match(name))
  }
}

export class PickleTagFilter {
  private readonly tagExpressionNode: any // cucumber-tag-expressions does not export interface

  constructor(tagExpression: string) {
    if (tagExpression) {
      this.tagExpressionNode = parse(tagExpression)
    }
  }

  matchesAllTagExpressions(pickle: messages.IPickle): boolean {
    if (!this.tagExpressionNode) {
      return true
    }
    return this.tagExpressionNode.evaluate(_.map(pickle.tags, 'name'))
  }
}
