import { EventEmitter } from 'node:events'
import * as messages from '@cucumber/messages'
import { IdGenerator } from '@cucumber/messages'
import { Group } from '@cucumber/cucumber-expressions'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { doesHaveValue } from '../value_checker'

export declare type IAssembledTestCases = Record<string, messages.TestCase>

export interface IAssembleTestCasesOptions {
  eventBroadcaster: EventEmitter
  newId: IdGenerator.NewId
  pickles: messages.Pickle[]
  supportCodeLibrary: SupportCodeLibrary
}

export async function assembleTestCases({
  eventBroadcaster,
  newId,
  pickles,
  supportCodeLibrary,
}: IAssembleTestCasesOptions): Promise<IAssembledTestCases> {
  const result: IAssembledTestCases = {}
  for (const pickle of pickles) {
    const { id: pickleId } = pickle
    const testCaseId = newId()
    const fromBeforeHooks: messages.TestStep[] = makeBeforeHookSteps({
      supportCodeLibrary,
      pickle,
      newId,
    })
    const fromStepDefinitions: messages.TestStep[] = makeSteps({
      pickle,
      supportCodeLibrary,
      newId,
    })
    const fromAfterHooks: messages.TestStep[] = makeAfterHookSteps({
      supportCodeLibrary,
      pickle,
      newId,
    })
    const testCase: messages.TestCase = {
      pickleId,
      id: testCaseId,
      testSteps: [
        ...fromBeforeHooks,
        ...fromStepDefinitions,
        ...fromAfterHooks,
      ],
    }
    eventBroadcaster.emit('envelope', { testCase })
    result[pickleId] = testCase
  }
  return result
}

function makeAfterHookSteps({
  supportCodeLibrary,
  pickle,
  newId,
}: {
  supportCodeLibrary: SupportCodeLibrary
  pickle: messages.Pickle
  newId: IdGenerator.NewId
}): messages.TestStep[] {
  return supportCodeLibrary.afterTestCaseHookDefinitions
    .slice(0)
    .reverse()
    .filter((hookDefinition) => hookDefinition.appliesToTestCase(pickle))
    .map((hookDefinition) => ({
      id: newId(),
      hookId: hookDefinition.id,
    }))
}

function makeBeforeHookSteps({
  supportCodeLibrary,
  pickle,
  newId,
}: {
  supportCodeLibrary: SupportCodeLibrary
  pickle: messages.Pickle
  newId: IdGenerator.NewId
}): messages.TestStep[] {
  return supportCodeLibrary.beforeTestCaseHookDefinitions
    .filter((hookDefinition) => hookDefinition.appliesToTestCase(pickle))
    .map((hookDefinition) => ({
      id: newId(),
      hookId: hookDefinition.id,
    }))
}

function makeSteps({
  pickle,
  supportCodeLibrary,
  newId,
}: {
  pickle: messages.Pickle
  supportCodeLibrary: SupportCodeLibrary
  newId: () => string
}): messages.TestStep[] {
  return pickle.steps.map((pickleStep) => {
    const stepDefinitions = supportCodeLibrary.stepDefinitions.filter(
      (stepDefinition) => stepDefinition.matchesStepName(pickleStep.text)
    )
    return {
      id: newId(),
      pickleStepId: pickleStep.id,
      stepDefinitionIds: stepDefinitions.map(
        (stepDefinition) => stepDefinition.id
      ),
      stepMatchArgumentsLists: stepDefinitions.map((stepDefinition) => {
        const result = stepDefinition.expression.match(pickleStep.text)
        return {
          stepMatchArguments: result.map((arg) => {
            return {
              group: mapArgumentGroup(arg.group),
              parameterTypeName: arg.parameterType.name,
            }
          }),
        }
      }),
    }
  })
}

function mapArgumentGroup(group: Group): messages.Group {
  return {
    start: group.start,
    value: group.value,
    children: doesHaveValue(group.children)
      ? group.children.map((child) => mapArgumentGroup(child))
      : undefined,
  }
}
