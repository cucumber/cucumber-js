import path from 'node:path'
import parse from '@cucumber/tag-expressions'
import * as messages from '@cucumber/messages'
import { getGherkinScenarioLocationMap } from './formatter/helpers/gherkin_document_parser'
import { doesHaveValue, doesNotHaveValue } from './value_checker'
import IGherkinDocument = messages.GherkinDocument
import IPickle = messages.Pickle

const FEATURE_LINENUM_REGEXP = /^(.*?)((?::[\d]+)+)?$/

export interface IPickleFilterOptions {
  cwd: string
  featurePaths?: string[]
  names?: string[]
  tagExpression?: string
}

export interface IMatchesAnyLineRequest {
  gherkinDocument: messages.GherkinDocument
  pickle: messages.Pickle
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

  matches({
    gherkinDocument,
    pickle,
  }: {
    gherkinDocument: IGherkinDocument
    pickle: IPickle
  }): boolean {
    return (
      this.lineFilter.matchesAnyLine({ gherkinDocument, pickle }) &&
      this.nameFilter.matchesAnyName(pickle) &&
      this.tagFilter.matchesAllTagExpressions(pickle)
    )
  }
}

export class PickleLineFilter {
  private readonly featureUriToLinesMapping: Record<string, number[]>

  constructor(cwd: string, featurePaths: string[] = []) {
    this.featureUriToLinesMapping = this.getFeatureUriToLinesMapping({
      cwd,
      featurePaths,
    })
  }

  getFeatureUriToLinesMapping({
    cwd,
    featurePaths,
  }: {
    cwd: string
    featurePaths: string[]
  }): Record<string, number[]> {
    const mapping: Record<string, number[]> = {}
    featurePaths.forEach((featurePath) => {
      const match = FEATURE_LINENUM_REGEXP.exec(featurePath)
      if (doesHaveValue(match)) {
        let uri = match[1]
        if (path.isAbsolute(uri)) {
          uri = path.relative(cwd, uri)
        } else {
          uri = path.normalize(uri)
        }
        const linesExpression = match[2]
        if (doesHaveValue(linesExpression)) {
          if (doesNotHaveValue(mapping[uri])) {
            mapping[uri] = []
          }
          linesExpression
            .slice(1)
            .split(':')
            .forEach((line) => {
              mapping[uri].push(parseInt(line))
            })
        }
      }
    })
    return mapping
  }

  matchesAnyLine({ gherkinDocument, pickle }: IMatchesAnyLineRequest): boolean {
    const uri = path.normalize(pickle.uri)
    const linesToMatch = this.featureUriToLinesMapping[uri]
    if (doesHaveValue(linesToMatch)) {
      const gherkinScenarioLocationMap =
        getGherkinScenarioLocationMap(gherkinDocument)
      const pickleLines = new Set(
        pickle.astNodeIds.map(
          (sourceId) => gherkinScenarioLocationMap[sourceId].line
        )
      )
      const linesIntersection = linesToMatch.filter((x) => pickleLines.has(x))
      return linesIntersection.length > 0
    }
    return true
  }
}

export class PickleNameFilter {
  private readonly names: string[]

  constructor(names: string[] = []) {
    this.names = names
  }

  matchesAnyName(pickle: messages.Pickle): boolean {
    if (this.names.length === 0) {
      return true
    }
    return this.names.some((name) => pickle.name.match(name))
  }
}

export class PickleTagFilter {
  private readonly tagExpressionNode: any // cucumber-tag-expressions does not export interface

  constructor(tagExpression: string) {
    if (doesHaveValue(tagExpression) && tagExpression !== '') {
      this.tagExpressionNode = parse(tagExpression)
    }
  }

  matchesAllTagExpressions(pickle: messages.Pickle): boolean {
    if (doesNotHaveValue(this.tagExpressionNode)) {
      return true
    }
    return this.tagExpressionNode.evaluate(pickle.tags.map((x) => x.name))
  }
}
