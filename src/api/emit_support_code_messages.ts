import { EventEmitter } from 'node:events'
import os from 'node:os'
import * as messages from '@cucumber/messages'
import { Envelope, HookType, IdGenerator } from '@cucumber/messages'
import detectCiEnvironment from '@cucumber/ci-environment'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { version } from '../version'
import { ILineAndUri } from '../types'

interface OrderedEnvelope {
  order: number
  envelope: messages.Envelope
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

function makeSourceReference(source: ILineAndUri) {
  return {
    uri: source.uri,
    location: {
      line: source.line,
    },
  }
}

function extractPatternSource(pattern: string | RegExp) {
  if (pattern instanceof RegExp) {
    return pattern.flags ? pattern.toString() : pattern.source
  }
  return pattern
}

function collectParameterTypeEnvelopes(
  supportCodeLibrary: SupportCodeLibrary,
  newId: IdGenerator.NewId
): ReadonlyArray<OrderedEnvelope> {
  const ordered: Array<OrderedEnvelope> = []
  for (const parameterType of supportCodeLibrary.parameterTypeRegistry
    .parameterTypes) {
    if (parameterType.builtin) {
      continue
    }
    const source =
      supportCodeLibrary.parameterTypeRegistry.lookupSource(parameterType)
    ordered.push({
      order: source.order,
      envelope: {
        parameterType: {
          id: newId(),
          name: parameterType.name,
          preferForRegularExpressionMatch: parameterType.preferForRegexpMatch,
          regularExpressions: parameterType.regexpStrings,
          useForSnippets: parameterType.useForSnippets,
          sourceReference: makeSourceReference(source),
        },
      },
    })
  }
  return ordered
}

function collectStepDefinitionEnvelopes(
  supportCodeLibrary: SupportCodeLibrary
): ReadonlyArray<OrderedEnvelope> {
  return supportCodeLibrary.stepDefinitions.map((stepDefinition) => ({
    order: stepDefinition.order,
    envelope: {
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
    },
  }))
}

function collectHookEnvelopes(
  supportCodeLibrary: SupportCodeLibrary
): ReadonlyArray<OrderedEnvelope> {
  const allHooks = [
    [
      supportCodeLibrary.beforeTestCaseHookDefinitions,
      HookType.BEFORE_TEST_CASE,
    ] as const,
    [
      supportCodeLibrary.afterTestCaseHookDefinitions,
      HookType.AFTER_TEST_CASE,
    ] as const,
    [
      supportCodeLibrary.beforeTestRunHookDefinitions,
      HookType.BEFORE_TEST_RUN,
    ] as const,
    [
      supportCodeLibrary.afterTestRunHookDefinitions,
      HookType.AFTER_TEST_RUN,
    ] as const,
  ]
  const ordered: Array<OrderedEnvelope> = []
  allHooks.forEach(([hooks, type]) => {
    hooks.forEach((hook) => {
      ordered.push({
        order: hook.order,
        envelope: {
          hook: {
            id: hook.id,
            type,
            name: hook.name,
            ...('tagExpression' in hook && {
              tagExpression: hook.tagExpression,
            }),
            sourceReference: makeSourceReference(hook),
          },
        } satisfies Envelope,
      })
    })
  })
  return ordered
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
  const orderedEnvelopes = [
    ...collectParameterTypeEnvelopes(supportCodeLibrary, newId),
    ...collectStepDefinitionEnvelopes(supportCodeLibrary),
    ...collectHookEnvelopes(supportCodeLibrary),
  ]
  orderedEnvelopes
    .sort((a, b) => a.order - b.order)
    .forEach(({ envelope }) => eventBroadcaster.emit('envelope', envelope))

  supportCodeLibrary.undefinedParameterTypes
    .map((undefinedParameterType) => ({
      undefinedParameterType,
    }))
    .forEach((envelope) => eventBroadcaster.emit('envelope', envelope))
}
