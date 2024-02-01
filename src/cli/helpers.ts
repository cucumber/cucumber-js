import detectCiEnvironment from '@cucumber/ci-environment'
import * as messages from '@cucumber/messages'
import { IdGenerator } from '@cucumber/messages'
import { EventEmitter } from 'events'
import shuffle from 'knuth-shuffle-seeded'
import os from 'os'
import { Readable } from 'stream'
import { IConfiguration, OptionSplitter } from '../configuration'
import { EventDataCollector } from '../formatter/helpers'
import { ILogger } from '../logger'
import { PickleOrder } from '../models/pickle_order'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import PickleFilter from '../pickle_filter'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { ILineAndUri } from '../types'
import { doesHaveValue } from '../value_checker'
import { version } from '../version'

interface IParseGherkinMessageStreamRequest {
  cwd?: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  gherkinMessageStream: Readable
  order: string
  pickleFilter: PickleFilter
}
interface MetaMessage extends messages.Meta {
  runName?: string
}
/**
 * Process a stream of envelopes from Gherkin and resolve to an array of filtered, ordered pickle Ids
 *
 * @param eventBroadcaster
 * @param eventDataCollector
 * @param gherkinMessageStream
 * @param order
 * @param pickleFilter
 */
export async function parseGherkinMessageStream({
  eventBroadcaster,
  eventDataCollector,
  gherkinMessageStream,
  order,
  pickleFilter,
}: IParseGherkinMessageStreamRequest): Promise<string[]> {
  return await new Promise<string[]>((resolve, reject) => {
    const result: string[] = []
    gherkinMessageStream.on('data', (envelope: messages.Envelope) => {
      eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.pickle)) {
        const pickle = envelope.pickle
        const pickleId = pickle.id
        const gherkinDocument = eventDataCollector.getGherkinDocument(
          pickle.uri
        )
        if (pickleFilter.matches({ gherkinDocument, pickle })) {
          result.push(pickleId)
        }
      }
    })
    gherkinMessageStream.on('end', () => {
      orderPickles(result, order, console)
      resolve(result)
    })
    gherkinMessageStream.on('error', reject)
  })
}

// Orders the pickleIds in place - morphs input
export function orderPickles<T = string>(
  pickleIds: T[],
  order: PickleOrder,
  logger: ILogger
): void {
  const [type, seed] = OptionSplitter.split(order)
  switch (type) {
    case 'defined':
      break
    case 'random':
      if (seed === '') {
        const newSeed = Math.floor(Math.random() * 1000 * 1000).toString()
        logger.warn(`Random order using seed: ${newSeed}`)
        shuffle(pickleIds, newSeed)
      } else {
        shuffle(pickleIds, seed)
      }
      break
    default:
      throw new Error(
        'Unrecgonized order type. Should be `defined` or `random`'
      )
  }
}

export async function emitMetaMessage(
  eventBroadcaster: EventEmitter,
  env: NodeJS.ProcessEnv,
  runName?: string
): Promise<void> {
  const meta: MetaMessage = {
    protocolVersion: messages.version,
    implementation: {
      version,
      name: 'cucumber-js',
    },
    cpu: {
      name: os.arch(),
    },
    os: {
      name: os.platform(),
      version: os.release(),
    },
    runtime: {
      name: 'node.js',
      version: process.versions.node,
    },
    ci: detectCiEnvironment(env),
    runName,
  }
  eventBroadcaster.emit('envelope', {
    meta,
  })
}

const makeSourceReference = (source: ILineAndUri) => ({
  uri: source.uri,
  location: {
    line: source.line,
  },
})

function emitParameterTypes(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter,
  newId: IdGenerator.NewId
): void {
  for (const parameterType of supportCodeLibrary.parameterTypeRegistry
    .parameterTypes) {
    if (parameterType.builtin) {
      continue
    }
    const source =
      supportCodeLibrary.parameterTypeRegistry.lookupSource(parameterType)
    const envelope: messages.Envelope = {
      parameterType: {
        id: newId(),
        name: parameterType.name,
        preferForRegularExpressionMatch: parameterType.preferForRegexpMatch,
        regularExpressions: parameterType.regexpStrings,
        useForSnippets: parameterType.useForSnippets,
        sourceReference: makeSourceReference(source),
      },
    }
    eventBroadcaster.emit('envelope', envelope)
  }
}

function emitUndefinedParameterTypes(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  for (const undefinedParameterType of supportCodeLibrary.undefinedParameterTypes) {
    const envelope: messages.Envelope = {
      undefinedParameterType,
    }
    eventBroadcaster.emit('envelope', envelope)
  }
}

function emitStepDefinitions(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  supportCodeLibrary.stepDefinitions.forEach((stepDefinition) => {
    const envelope: messages.Envelope = {
      stepDefinition: {
        id: stepDefinition.id,
        pattern: {
          source: stepDefinition.pattern.toString(),
          type:
            typeof stepDefinition.pattern === 'string'
              ? messages.StepDefinitionPatternType.CUCUMBER_EXPRESSION
              : messages.StepDefinitionPatternType.REGULAR_EXPRESSION,
        },
        sourceReference: makeSourceReference(stepDefinition),
      },
    }
    eventBroadcaster.emit('envelope', envelope)
  })
}

function emitTestCaseHooks(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  ;[]
    .concat(
      supportCodeLibrary.beforeTestCaseHookDefinitions,
      supportCodeLibrary.afterTestCaseHookDefinitions
    )
    .forEach((testCaseHookDefinition: TestCaseHookDefinition) => {
      const envelope: messages.Envelope = {
        hook: {
          id: testCaseHookDefinition.id,
          name: testCaseHookDefinition.name,
          tagExpression: testCaseHookDefinition.tagExpression,
          sourceReference: makeSourceReference(testCaseHookDefinition),
        },
      }
      eventBroadcaster.emit('envelope', envelope)
    })
}

function emitTestRunHooks(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  ;[]
    .concat(
      supportCodeLibrary.beforeTestRunHookDefinitions,
      supportCodeLibrary.afterTestRunHookDefinitions
    )
    .forEach((testRunHookDefinition: TestRunHookDefinition) => {
      const envelope: messages.Envelope = {
        hook: {
          id: testRunHookDefinition.id,
          sourceReference: makeSourceReference(testRunHookDefinition),
        },
      }
      eventBroadcaster.emit('envelope', envelope)
    })
}

export function emitSupportCodeMessages({
  eventBroadcaster,
  supportCodeLibrary,
  newId,
}: {
  eventBroadcaster: EventEmitter
  supportCodeLibrary: ISupportCodeLibrary
  newId: IdGenerator.NewId
}): void {
  emitParameterTypes(supportCodeLibrary, eventBroadcaster, newId)
  emitUndefinedParameterTypes(supportCodeLibrary, eventBroadcaster)
  emitStepDefinitions(supportCodeLibrary, eventBroadcaster)
  emitTestCaseHooks(supportCodeLibrary, eventBroadcaster)
  emitTestRunHooks(supportCodeLibrary, eventBroadcaster)
}

export function getRunName(argvConfiguration: Partial<IConfiguration>): string {
  if (doesHaveValue(argvConfiguration.runName)) {
    return argvConfiguration.runName
  }
  if (
    doesHaveValue(argvConfiguration.name && argvConfiguration.name.length > 0)
  ) {
    return argvConfiguration.name[0]
  }
  if (doesHaveValue(argvConfiguration.tags)) {
    //replace word "and" with &  and "or" with |
    let tags = argvConfiguration.tags
      .split(' ')
      .map((tag) => (tag === 'and' ? '&' : tag === 'or' ? '|' : tag))
      .join('')
    //remove the starting and ending paranthesis if present
    tags = tags.replace(/^\(/, '').replace(/\)$/, '')

    return tags
  }
  return ''
}
