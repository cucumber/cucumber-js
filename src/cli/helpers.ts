import ArgvParser from './argv_parser'
import ProfileLoader from './profile_loader'
import shuffle from 'knuth-shuffle-seeded'
import { EventEmitter } from 'events'
import PickleFilter from '../pickle_filter'
import { EventDataCollector } from '../formatter/helpers'
import { doesHaveValue } from '../value_checker'
import OptionSplitter from './option_splitter'
import { Readable } from 'stream'
import os from 'os'
import * as messages from '@cucumber/messages'
import { IdGenerator } from '@cucumber/messages'
import detectCiEnvironment from '@cucumber/ci-environment'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import { builtinParameterTypes } from '../support_code_library_builder'
import { version } from '../version'

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
  const profileArgv = await new ProfileLoader(cwd).getArgv(
    options.profile,
    options.config
  )
  if (profileArgv.length > 0) {
    fullArgv = argv.slice(0, 2).concat(profileArgv).concat(argv.slice(2))
  }
  return fullArgv
}

interface IParseGherkinMessageStreamRequest {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  gherkinMessageStream: Readable
  order: PickleOrder
  pickleFilter: PickleFilter
}

export type PickleOrder = 'defined' | 'random'

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
      if (doesHaveValue(envelope.parseError)) {
        reject(
          new Error(
            `Parse error in '${envelope.parseError.source.uri}': ${envelope.parseError.message}`
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
export function orderPickleIds(pickleIds: string[], order: PickleOrder): void {
  const [type, seed] = OptionSplitter.split(order)
  switch (type) {
    case 'defined':
      break
    case 'random':
      if (seed === '') {
        const newSeed = Math.floor(Math.random() * 1000 * 1000).toString()
        console.warn(`Random order using seed: ${newSeed}`)
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

export function isJavaScript(filePath: string): boolean {
  return (
    filePath.endsWith('.js') ||
    filePath.endsWith('.mjs') ||
    filePath.endsWith('.cjs')
  )
}

export async function emitMetaMessage(
  eventBroadcaster: EventEmitter,
  env: NodeJS.ProcessEnv
): Promise<void> {
  const meta: messages.Meta = {
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
  }
  eventBroadcaster.emit('envelope', {
    meta,
  })
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
    const envelope: messages.Envelope = {
      parameterType: {
        id: newId(),
        name: parameterType.name,
        preferForRegularExpressionMatch: parameterType.preferForRegexpMatch,
        regularExpressions: parameterType.regexpStrings,
        useForSnippets: parameterType.useForSnippets,
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
        sourceReference: {
          uri: stepDefinition.uri,
          location: {
            line: stepDefinition.line,
          },
        },
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
          tagExpression: testCaseHookDefinition.tagExpression,
          sourceReference: {
            uri: testCaseHookDefinition.uri,
            location: {
              line: testCaseHookDefinition.line,
            },
          },
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
          sourceReference: {
            uri: testRunHookDefinition.uri,
            location: {
              line: testRunHookDefinition.line,
            },
          },
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
