import { EventEmitter } from 'node:events'
import {
  Envelope,
  IdGenerator,
  Pickle,
  TestCase,
  TestStep,
  Group as MessagesGroup,
} from '@cucumber/messages'
import { Group } from '@cucumber/cucumber-expressions'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { doesHaveValue } from '../value_checker'
import { AssembledTestCase, SourcedPickle } from './types'

export async function assembleTestCases({
  eventBroadcaster,
  newId,
  sourcedPickles,
  supportCodeLibrary,
}: {
  eventBroadcaster: EventEmitter
  newId: IdGenerator.NewId
  sourcedPickles: ReadonlyArray<SourcedPickle>
  supportCodeLibrary: SupportCodeLibrary
}): Promise<ReadonlyArray<AssembledTestCase>> {
  return sourcedPickles.map(({ gherkinDocument, pickle }) => {
    const testCaseId = newId()
    const fromBeforeHooks: TestStep[] = makeBeforeHookSteps({
      supportCodeLibrary,
      pickle,
      newId,
    })
    const fromStepDefinitions: TestStep[] = makeSteps({
      pickle,
      supportCodeLibrary,
      newId,
    })
    const fromAfterHooks: TestStep[] = makeAfterHookSteps({
      supportCodeLibrary,
      pickle,
      newId,
    })
    const testCase: TestCase = {
      pickleId: pickle.id,
      id: testCaseId,
      testSteps: [
        ...fromBeforeHooks,
        ...fromStepDefinitions,
        ...fromAfterHooks,
      ],
    }
    eventBroadcaster.emit('envelope', { testCase } satisfies Envelope)
    return {
      gherkinDocument,
      pickle,
      testCase,
    }
  })
}

function makeAfterHookSteps({
  supportCodeLibrary,
  pickle,
  newId,
}: {
  supportCodeLibrary: SupportCodeLibrary
  pickle: Pickle
  newId: IdGenerator.NewId
}): TestStep[] {
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
  pickle: Pickle
  newId: IdGenerator.NewId
}): TestStep[] {
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
  pickle: Pickle
  supportCodeLibrary: SupportCodeLibrary
  newId: () => string
}): TestStep[] {
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

function mapArgumentGroup(group: Group): MessagesGroup {
  return {
    start: group.start,
    value: group.value,
    children: doesHaveValue(group.children)
      ? group.children.map((child) => mapArgumentGroup(child))
      : undefined,
  }
}
