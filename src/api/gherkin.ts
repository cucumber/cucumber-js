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

interface PickleWithDocument {
  gherkinDocument: GherkinDocument
  location: Location
  pickle: Pickle
}

export async function loadSourcesInternal({
  newId,
  cwd,
  logger,
  unexpandedFeaturePaths,
  featurePaths,
  coordinates,
}: {
  newId: IdGenerator.NewId
  cwd: string
  logger: Console
  unexpandedFeaturePaths: string[]
  featurePaths: string[]
  coordinates: ISourcesCoordinates
}): Promise<{
  filteredPickles: PickleWithDocument[]
  parseErrors: ParseError[]
}> {
  if (featurePaths.length === 0) {
    return {
      filteredPickles: [],
      parseErrors: [],
    }
  }
  const gherkinQuery = new GherkinQuery()
  const parseErrors: ParseError[] = []
  await gherkinFromPaths(
    featurePaths,
    {
      newId,
      relativeTo: cwd,
      defaultDialect: coordinates.defaultDialect,
    },
    (message) => {
      gherkinQuery.update(message)
      if (message.parseError) {
        parseErrors.push(message.parseError)
      }
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
  onMessage: (envelope: Envelope) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const gherkinMessageStream = GherkinStreams.fromPaths(paths, options)
    gherkinMessageStream.on('data', onMessage)
    gherkinMessageStream.on('end', resolve)
    gherkinMessageStream.on('error', reject)
  })
}
