import {
  GherkinStreams,
  IGherkinStreamOptions,
} from '@cucumber/gherkin-streams'
import {
  Envelope,
  GherkinDocument,
  IdGenerator,
  Location,
  ParseError,
  Pickle,
} from '@cucumber/messages'
import { Query as GherkinQuery } from '@cucumber/gherkin-utils'
import PickleFilter from '../pickle_filter'
import { orderPickles } from '../cli/helpers'
import { ISourcesCoordinates } from './types'
import { ILogger } from '../logger'
import {
  generateExamplesFromFunction,
  generateTestData,
  generateExamplesFromFunctionGherkin,
} from '../formatter/feature_data_format'
import path from 'node:path'
interface PickleWithDocument {
  gherkinDocument: GherkinDocument
  location: Location
  pickle: Pickle
}

interface FunctionVars {
  previous: {
    header: string
    value: any
  }[]
  new: {
    header: string
    value: any
  }[]
}

export async function getFilteredPicklesAndErrors({
  newId,
  cwd,
  logger,
  unexpandedFeaturePaths,
  featurePaths,
  coordinates,
  onEnvelope,
}: {
  newId: IdGenerator.NewId
  cwd: string
  logger: ILogger
  unexpandedFeaturePaths: string[]
  featurePaths: string[]
  coordinates: ISourcesCoordinates
  onEnvelope?: (envelope: Envelope) => void
}): Promise<{
  filteredPickles: PickleWithDocument[]
  parseErrors: ParseError[]
}> {
  const gherkinQuery = new GherkinQuery()
  const parseErrors: ParseError[] = []
  let variables: any,
    fakeData: {
      var: string
      fake: string
    }[],
    pickleIndex = 0
  let dataFunction: string | null = null
  let functionVars: FunctionVars | null = null
  let mjsDataFiles: any = null
  let projectDir = process.cwd()
  if (featurePaths.length > 0) {
    projectDir = path.join(path.dirname(featurePaths[0]), '..', '..')
  }
  await gherkinFromPaths(
    featurePaths,
    {
      newId,
      relativeTo: cwd,
      defaultDialect: coordinates.defaultDialect,
    },
    (envelope) => {
      if (envelope.source) {
        let newDataAfterExamplesModify = envelope.source.data
        const functionMatch = envelope.source.data.match(
          /@data:function:(.*?)\.(.*)/
        )

        if (functionMatch) {
          dataFunction = functionMatch[2]
          const { newData, mjsData } = generateExamplesFromFunction(
            envelope.source.data,
            featurePaths[0],
            dataFunction,
            functionMatch[1]
          )
          newDataAfterExamplesModify = newData
          mjsDataFiles = mjsData
        }

        const data = generateTestData(
          newDataAfterExamplesModify,
          undefined,
          undefined,
          projectDir
        )
        envelope.source.data = data.newContent
        variables = data.variables
        fakeData = data.otherFakeData
      }

      if (envelope.gherkinDocument && envelope.gherkinDocument.feature) {
        envelope.gherkinDocument.feature.children =
          envelope.gherkinDocument.feature.children.map((scenario) => {
            if (scenario.scenario) {
              if (dataFunction) {
                const { tableHeader, tableBody } = scenario.scenario.examples[0]

                functionVars = {
                  previous: tableHeader.cells.map((cell, index) => ({
                    header: cell.value,
                    value: tableBody[0].cells[index].value,
                  })),
                  new: [],
                }

                const generateResult = generateExamplesFromFunctionGherkin(
                  tableHeader.cells,
                  tableBody[0].cells,
                  mjsDataFiles
                )

                functionVars.new = generateResult

                generateResult.map(
                  ({ value }, index) =>
                    (scenario.scenario.examples[0].tableBody[0].cells[
                      index
                    ].value = value)
                )
              }
              let fakeDataIdx = 0
              scenario.scenario.examples.forEach((example) => {
                example.tableBody.forEach((row) => {
                  row.cells.forEach((cell, index) => {
                    if (
                      fakeDataIdx < fakeData.length &&
                      fakeData[fakeDataIdx].var === cell.value
                    ) {
                      cell.value = fakeData[fakeDataIdx].fake
                      fakeDataIdx++
                    }
                  })
                })
              })
              scenario.scenario.steps = scenario.scenario.steps.map((step) => {
                step.text = generateTestData(
                  step.text,
                  variables,
                  fakeData
                ).newContent
                return step
              })
            }
            return scenario
          })
      }

      if (envelope.pickle) {
        envelope.pickle.steps = envelope.pickle.steps.map((step) => {
          if (functionVars) {
            functionVars.new.forEach(({ value }, index) => {
              step.text = step.text.replace(
                functionVars.previous[index].value,
                value
              )
            })
          }
          const generateData = generateTestData(step.text, variables, fakeData)
          step.text = generateData.newContent
          pickleIndex =
            generateData.fakeIndex > pickleIndex
              ? generateData.fakeIndex
              : pickleIndex
          return step
        })

        for (let i = 0; i < pickleIndex; i++) {
          fakeData.shift()
        }
        pickleIndex = 0
      }

      gherkinQuery.update(envelope)
      if (envelope.parseError) {
        parseErrors.push(envelope.parseError)
      }
      onEnvelope?.(envelope)
    }
  )
  const pickleFilter = new PickleFilter({
    cwd,
    featurePaths: unexpandedFeaturePaths,
    names: coordinates.names,
    tagExpression: coordinates.tagExpression,
  })
  const filteredPickles: PickleWithDocument[] = gherkinQuery
    .getPickles()
    .filter((pickle) => {
      const gherkinDocument = gherkinQuery
        .getGherkinDocuments()
        .find((doc) => doc.uri === pickle.uri)
      return pickleFilter.matches({ gherkinDocument, pickle })
    })
    .map((pickle) => {
      const gherkinDocument = gherkinQuery
        .getGherkinDocuments()
        .find((doc) => doc.uri === pickle.uri)
      const location = gherkinQuery.getLocation(
        pickle.astNodeIds[pickle.astNodeIds.length - 1]
      )
      return {
        gherkinDocument,
        location,
        pickle,
      }
    })
  orderPickles(filteredPickles, coordinates.order, logger)
  return {
    filteredPickles,
    parseErrors,
  }
}

async function gherkinFromPaths(
  paths: string[],
  options: IGherkinStreamOptions,
  onEnvelope: (envelope: Envelope) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const gherkinMessageStream = GherkinStreams.fromPaths(paths, options)
    gherkinMessageStream.on('data', onEnvelope)
    gherkinMessageStream.on('end', resolve)
    gherkinMessageStream.on('error', reject)
  })
}
