import _, { clone } from 'lodash'
import ArgvParser from './argv_parser'
import ProfileLoader from './profile_loader'
import shuffle from 'knuth-shuffle-seeded'
import path from 'path'
import { EventEmitter } from 'events'
import PickleFilter from '../pickle_filter'
import { EventDataCollector } from '../formatter/helpers'
import { doesHaveValue } from '../value_checker'
import OptionSplitter from './option_splitter'
import { Readable } from 'stream'
import { messages, IdGenerator } from '@cucumber/messages'
import createMeta from '@cucumber/create-meta'
import readPkgUp from 'read-pkg-up'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import { builtinParameterTypes } from '../support_code_library_builder'

const StepDefinitionPatternType =
  messages.StepDefinition.StepDefinitionPattern.StepDefinitionPatternType

export interface IGetExpandedArgvRequest {
  argv: string[]
  cwd: string
}

export async function getExpandedArgv({
  argv,
  cwd,
}: IGetExpandedArgvRequest): Promise<string[]> {
  const { options } = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}

interface IParseGherkinMessageStreamRequest {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  gherkinMessageStream: Readable
  order: string
  pickleFilter: PickleFilter
}

export async function parseGherkinMessageStream({
  cwd,
  eventBroadcaster,
  eventDataCollector,
  gherkinMessageStream,
  order,
  pickleFilter,
}: IParseGherkinMessageStreamRequest): Promise<string[]> {
  return await new Promise<string[]>((resolve, reject) => {
    const result: string[] = []
    gherkinMessageStream.on('data', (envelope: messages.IEnvelope) => {
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
      if (doesHaveValue(envelope.parseError)) {
        reject(
          new Error(
            `Parse error in '${path.relative(
              cwd,
              envelope.parseError.source.uri
            )}': ${envelope.parseError.message}`
          )
        )
      }
    })
    gherkinMessageStream.on('end', () => {
      orderPickleIds(result, order)
      resolve(result)
    })
    gherkinMessageStream.on('error', reject)
  })
}

// Orders the pickleIds in place - morphs input
export function orderPickleIds(pickleIds: string[], order: string): void {
  let [type, seed] = OptionSplitter.split(order)
  switch (type) {
    case 'defined':
      break
    case 'random':
      if (seed === '') {
        seed = Math.floor(Math.random() * 1000 * 1000).toString()
        console.warn(`Random order using seed: ${seed}`)
      }
      shuffle(pickleIds, seed)
      break
    default:
      throw new Error(
        'Unrecgonized order type. Should be `defined` or `random`'
      )
  }
}

export async function emitMetaMessage(
  eventBroadcaster: EventEmitter
): Promise<void> {
  const version = (await readPkgUp()).packageJson.version
  eventBroadcaster.emit(
    'envelope',
    new messages.Envelope({
      meta: createMeta('cucumber-js', version, process.env),
    })
  )
}

function emitParameterTypes(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter,
  newId: IdGenerator.NewId
): void {
  for (const parameterType of supportCodeLibrary.parameterTypeRegistry
    .parameterTypes) {
    if (builtinParameterTypes.includes(parameterType.name)) {
      continue
    }
    eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        parameterType: {
          id: newId(),
          name: parameterType.name,
          preferForRegularExpressionMatch: parameterType.preferForRegexpMatch,
          regularExpressions: parameterType.regexpStrings,
          useForSnippets: parameterType.useForSnippets,
        },
      })
    )
  }
}

function emitUndefinedParameterTypes(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  for (const undefinedParameterType of supportCodeLibrary.undefinedParameterTypes) {
    eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        undefinedParameterType,
      })
    )
  }
}

function emitStepDefinitions(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  supportCodeLibrary.stepDefinitions.forEach((stepDefinition) => {
    eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        stepDefinition: {
          id: stepDefinition.id,
          pattern: {
            source: stepDefinition.pattern.toString(),
            type:
              typeof stepDefinition.pattern === 'string'
                ? StepDefinitionPatternType.CUCUMBER_EXPRESSION
                : StepDefinitionPatternType.REGULAR_EXPRESSION,
          },
          sourceReference: {
            uri: stepDefinition.uri,
            location: {
              line: stepDefinition.line,
            },
          },
        },
      })
    )
  })
}

function emitTestCaseHooks(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  ;[]
    .concat(
      supportCodeLibrary.beforeTestCaseHookDefinitions,
      // order has been reversed before - need it back in original order
      clone(supportCodeLibrary.afterTestCaseHookDefinitions).reverse()
    )
    .forEach((testCaseHookDefinition: TestCaseHookDefinition) => {
      eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          hook: {
            id: testCaseHookDefinition.id,
            tagExpression: testCaseHookDefinition.tagExpression,
            sourceReference: {
              uri: testCaseHookDefinition.uri,
              location: {
                line: testCaseHookDefinition.line,
              },
            },
          },
        })
      )
    })
}

function emitTestRunHooks(
  supportCodeLibrary: ISupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  ;[]
    .concat(
      supportCodeLibrary.beforeTestRunHookDefinitions,
      // order has been reversed before - need it back in original order
      clone(supportCodeLibrary.afterTestRunHookDefinitions).reverse()
    )
    .forEach((testRunHookDefinition: TestRunHookDefinition) => {
      eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          hook: {
            id: testRunHookDefinition.id,
            sourceReference: {
              uri: testRunHookDefinition.uri,
              location: {
                line: testRunHookDefinition.line,
              },
            },
          },
        })
      )
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
