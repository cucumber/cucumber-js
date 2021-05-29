import { EventEmitter } from 'events'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { Group } from '@cucumber/cucumber-expressions'
import { doesHaveValue } from '../value_checker'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import { clone } from 'lodash'
import StepDefinition from '../models/step_definition'

export interface ITestStep {
  id: string
  isBeforeHook?: boolean
  isHook: boolean
  hookDefinition?: TestCaseHookDefinition
  pickleStep?: messages.PickleStep
  stepDefinitions?: StepDefinition[]
}

export interface ISupportCodeFilterOptionsForTestCase {
  supportCodeLibrary: ISupportCodeLibrary
  pickle: messages.Pickle
}

export interface ISupportCodeFilterOptionsForTestStep {
  supportCodeLibrary: ISupportCodeLibrary
  pickleStep: messages.PickleStep
}

export declare type IAssembledTestCases = Record<string, messages.TestCase>

export interface IAssembleTestCasesOptions {
  eventBroadcaster: EventEmitter
  newId: IdGenerator.NewId
  pickles: messages.Pickle[]
  supportCodeLibrary: ISupportCodeLibrary
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
    const fromBeforeHooks: messages.TestStep[] = getBeforeHookDefinitions({
      supportCodeLibrary,
      pickle,
    }).map((hookDefinition) => ({
      id: newId(),
      hookId: hookDefinition.id,
    }))
    const fromStepDefinitions: messages.TestStep[] = pickle.steps.map(
      (pickleStep) => {
        const stepDefinitions = getStepDefinitions({
          supportCodeLibrary,
          pickleStep,
        })
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
      }
    )
    const fromAfterHooks: messages.TestStep[] = getAfterHookDefinitions({
      supportCodeLibrary,
      pickle,
    }).map((hookDefinition) => ({
      id: newId(),
      hookId: hookDefinition.id,
    }))
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

export async function assembleTestSteps({
  newId,
  pickle,
  supportCodeLibrary,
}: {
  newId: IdGenerator.NewId
  pickle: messages.Pickle
  supportCodeLibrary: ISupportCodeLibrary
}): Promise<ITestStep[]> {
  const testSteps: ITestStep[] = []
  getBeforeHookDefinitions({
    supportCodeLibrary,
    pickle,
  }).forEach((hookDefinition) => {
    testSteps.push({
      id: newId(),
      hookDefinition,
      isHook: true,
      isBeforeHook: true,
    })
  })
  pickle.steps.forEach((pickleStep) => {
    const stepDefinitions = getStepDefinitions({
      supportCodeLibrary,
      pickleStep,
    })
    testSteps.push({
      id: newId(),
      pickleStep,
      stepDefinitions,
      isHook: false,
    })
  })
  getAfterHookDefinitions({
    supportCodeLibrary,
    pickle,
  }).forEach((hookDefinition) => {
    testSteps.push({
      id: newId(),
      hookDefinition,
      isHook: true,
    })
  })
  return testSteps
}

function getAfterHookDefinitions({
  supportCodeLibrary,
  pickle,
}: ISupportCodeFilterOptionsForTestCase): TestCaseHookDefinition[] {
  return clone(supportCodeLibrary.afterTestCaseHookDefinitions)
    .reverse()
    .filter((hookDefinition) => hookDefinition.appliesToTestCase(pickle))
}

function getBeforeHookDefinitions({
  supportCodeLibrary,
  pickle,
}: ISupportCodeFilterOptionsForTestCase): TestCaseHookDefinition[] {
  return supportCodeLibrary.beforeTestCaseHookDefinitions.filter(
    (hookDefinition) => hookDefinition.appliesToTestCase(pickle)
  )
}

function getStepDefinitions({
  supportCodeLibrary,
  pickleStep,
}: ISupportCodeFilterOptionsForTestStep): StepDefinition[] {
  return supportCodeLibrary.stepDefinitions.filter((stepDefinition) =>
    stepDefinition.matchesStepName(pickleStep.text)
  )
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
