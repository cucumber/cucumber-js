import * as messages from '@cucumber/messages'
import {
  doesHaveValue,
  doesNotHaveValue,
  valueOrDefault,
} from '../../src/value_checker'
import {
  IJsonFeature,
  IJsonScenario,
  IJsonStep,
} from '../../src/formatter/json_formatter'

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null
}

// Converting windows stack trace to posix and removing cwd
//    C:\\project\\path\\features\\support/code.js
//      becomes
//    features/support/code.js
function normalizeExceptionAndUri(exception: string, cwd: string): string {
  return exception
    .replace(cwd, '')
    .replace(/\\/g, '/')
    .replace('/features', 'features')
    .split('\n')[0]
}

function normalizeMessage(
  obj: messages.Envelope[keyof messages.Envelope],
  cwd: string
): void {
  if (isObject(obj)) {
    if (typeof obj.uri === 'string') {
      obj.uri = normalizeExceptionAndUri(obj.uri, cwd)
    }
    if (
      isObject(obj.sourceReference) &&
      typeof obj.sourceReference.uri === 'string'
    ) {
      obj.sourceReference.uri = normalizeExceptionAndUri(
        obj.sourceReference.uri,
        cwd
      )
    }
    if (isObject(obj.testStepResult)) {
      if (isObject(obj.testStepResult.duration)) {
        obj.testStepResult.duration.nanos = 0
      }
      if (typeof obj.testStepResult.message === 'string') {
        obj.testStepResult.message = normalizeExceptionAndUri(
          obj.testStepResult.message,
          cwd
        )
      }
    }
  }
}

export function normalizeMessageOutput(
  envelopeObjects: messages.Envelope[],
  cwd: string
): messages.Envelope[] {
  envelopeObjects.forEach((e: messages.Envelope) => {
    const keys = Object.keys(e) as (keyof messages.Envelope)[]
    keys.forEach((key) => {
      normalizeMessage(e[key], cwd)
    })
  })
  return envelopeObjects
}

export function stripMetaMessages(
  envelopeObjects: messages.Envelope[]
): messages.Envelope[] {
  return envelopeObjects.filter((e) => {
    // filter off meta objects, almost none of it predictable/useful for testing
    return doesNotHaveValue(e.meta)
  })
}

export function normalizeJsonOutput(str: string, cwd: string): IJsonFeature[] {
  const json: IJsonFeature[] = JSON.parse(valueOrDefault(str, '[]'))
  json.forEach((feature: IJsonFeature) => {
    if (doesHaveValue(feature.uri)) {
      feature.uri = normalizeExceptionAndUri(feature.uri, cwd)
    }
    feature.elements.forEach((element: IJsonScenario) => {
      element.steps.forEach((step: IJsonStep) => {
        if (doesHaveValue(step.match) && doesHaveValue(step.match.location)) {
          step.match.location = normalizeExceptionAndUri(
            step.match.location,
            cwd
          )
        }
        if (doesHaveValue(step.result)) {
          if (doesHaveValue(step.result.duration)) {
            step.result.duration = 0
          }
          if (doesHaveValue(step.result.error_message)) {
            step.result.error_message = normalizeExceptionAndUri(
              step.result.error_message,
              cwd
            )
          }
        }
      })
    })
  })
  return json
}

export const ignorableKeys = [
  'meta',
  // sources
  'uri',
  'line',
  // ids
  'astNodeId',
  'astNodeIds',
  'hookId',
  'id',
  'pickleId',
  'pickleStepId',
  'stepDefinitionIds',
  'testRunStartedId',
  'testRunHookStartedId',
  'testCaseId',
  'testCaseStartedId',
  'testStepId',
  // time
  'nanos',
  'seconds',
  // errors
  'message',
  'stackTrace',
  // snippets
  'language',
  'code',
]
