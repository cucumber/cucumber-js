import { EventEmitter } from 'node:events'
import os from 'node:os'
import shuffle from 'knuth-shuffle-seeded'
import * as messages from '@cucumber/messages'
import { Envelope, HookType, IdGenerator } from '@cucumber/messages'
import detectCiEnvironment from '@cucumber/ci-environment'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { version } from '../version'
import { ILogger } from '../environment'
import { ILineAndUri } from '../types'
import { IPickleOrder } from '../filter'

// Orders the pickleIds in place - morphs input
export function orderPickles<T = string>(
  pickleIds: T[],
  order: IPickleOrder,
  logger: ILogger
): void {
  const [type, seed] = splitOrder(order)
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
        'Unrecognized order type. Should be `defined` or `random`'
      )
  }
}

function splitOrder(order: string) {
  if (!order.includes(':')) {
    return [order, '']
  }
  return order.split(':')
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

const makeSourceReference = (source: ILineAndUri) => ({
  uri: source.uri,
  location: {
    line: source.line,
  },
})

function emitParameterTypes(
  supportCodeLibrary: SupportCodeLibrary,
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
  supportCodeLibrary: SupportCodeLibrary,
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
  supportCodeLibrary: SupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  supportCodeLibrary.stepDefinitions.forEach((stepDefinition) => {
    const envelope: messages.Envelope = {
      stepDefinition: {
        id: stepDefinition.id,
        pattern: {
          source: extractPatternSource(stepDefinition.pattern),
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

function extractPatternSource(pattern: string | RegExp) {
  if (pattern instanceof RegExp) {
    return pattern.flags ? pattern.toString() : pattern.source;
  }
  return pattern;
}

function emitTestCaseHooks(
  supportCodeLibrary: SupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  ;[
    [
      supportCodeLibrary.beforeTestCaseHookDefinitions,
      HookType.BEFORE_TEST_CASE,
    ] as const,
    [
      supportCodeLibrary.afterTestCaseHookDefinitions,
      HookType.AFTER_TEST_CASE,
    ] as const,
  ].forEach(([hooks, type]) => {
    hooks.forEach((hook) => {
      eventBroadcaster.emit('envelope', {
        hook: {
          id: hook.id,
          type,
          name: hook.name,
          tagExpression: hook.tagExpression,
          sourceReference: makeSourceReference(hook),
        },
      } satisfies Envelope)
    })
  })
}

function emitTestRunHooks(
  supportCodeLibrary: SupportCodeLibrary,
  eventBroadcaster: EventEmitter
): void {
  ;[
    [
      supportCodeLibrary.beforeTestRunHookDefinitions,
      HookType.BEFORE_TEST_RUN,
    ] as const,
    [
      supportCodeLibrary.afterTestRunHookDefinitions,
      HookType.AFTER_TEST_RUN,
    ] as const,
  ].forEach(([hooks, type]) => {
    hooks.forEach((hook) => {
      eventBroadcaster.emit('envelope', {
        hook: {
          id: hook.id,
          type,
          sourceReference: makeSourceReference(hook),
        },
      } satisfies Envelope)
    })
  })
}

export function emitSupportCodeMessages({
  eventBroadcaster,
  supportCodeLibrary,
  newId,
}: {
  eventBroadcaster: EventEmitter
  supportCodeLibrary: SupportCodeLibrary
  newId: IdGenerator.NewId
}): void {
  emitParameterTypes(supportCodeLibrary, eventBroadcaster, newId)
  emitUndefinedParameterTypes(supportCodeLibrary, eventBroadcaster)
  emitStepDefinitions(supportCodeLibrary, eventBroadcaster)
  emitTestCaseHooks(supportCodeLibrary, eventBroadcaster)
  emitTestRunHooks(supportCodeLibrary, eventBroadcaster)
}
