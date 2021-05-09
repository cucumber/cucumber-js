import { EventEmitter } from 'events'
import { IdGenerator, messages } from '@cucumber/messages'
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
  pickleStep?: messages.Pickle.IPickleStep
  stepDefinitions?: StepDefinition[]
}

export interface ISupportCodeFilterOptionsForTestCase {
  supportCodeLibrary: ISupportCodeLibrary
  pickle: messages.IPickle
}

export interface ISupportCodeFilterOptionsForTestStep {
  supportCodeLibrary: ISupportCodeLibrary
  pickleStep: messages.Pickle.IPickleStep
}

export declare type IAssembledTestCases = Record<
  string,
  {
    testCase: messages.ITestCase
    testSteps: ITestStep[]
  }
>

export interface IAssembleTestCasesOptions {
  eventBroadcaster: EventEmitter
  newId: IdGenerator.NewId
  pickles: messages.IPickle[]
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
    const testSteps: ITestStep[] = await assembleTestSteps({
      newId,
      pickle,
      supportCodeLibrary,
    })
    const testCase = {
      pickleId,
      id: testCaseId,
      testSteps: testSteps.map((testStep) => {
        if (testStep.isHook) {
          return {
            id: testStep.id,
            hookId: testStep.hookDefinition.id,
          }
        } else {
          return {
            id: testStep.id,
            pickleStepId: testStep.pickleStep.id,
            stepDefinitionIds: testStep.stepDefinitions.map((x) => x.id),
            stepMatchArgumentsLists: testStep.stepDefinitions.map((x) => {
              const result = x.expression.match(testStep.pickleStep.text)
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
      }),
    }
    eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({ testCase })
    )
    result[pickleId] = { testCase, testSteps }
  }
  return result
}

async function assembleTestSteps({
  newId,
  pickle,
  supportCodeLibrary,
}: {
  newId: IdGenerator.NewId
  pickle: messages.IPickle
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

// TODO break filter fns out to a new file?

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

function mapArgumentGroup(
  group: Group
): messages.TestCase.TestStep.StepMatchArgumentsList.StepMatchArgument.IGroup {
  return {
    start: group.start,
    value: group.value,
    children: doesHaveValue(group.children)
      ? group.children.map((child) => mapArgumentGroup(child))
      : undefined,
  }
}
