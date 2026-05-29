import {
  type IdGenerator,
  type PickleStep,
  PickleStepType,
  type Suggestion,
} from '@cucumber/messages'
import { KeywordType } from '../formatter/helpers'
import type StepDefinitionSnippetBuilder from '../formatter/step_definition_snippet_builder'

function mapPickleStepTypeToKeywordType(type?: PickleStepType): KeywordType {
  switch (type) {
    case PickleStepType.CONTEXT:
      return KeywordType.Precondition
    case PickleStepType.ACTION:
      return KeywordType.Event
    case PickleStepType.OUTCOME:
      return KeywordType.Outcome
    default:
      return KeywordType.Precondition
  }
}

export function makeSuggestion({
  newId,
  snippetBuilder,
  pickleStep,
}: {
  newId: IdGenerator.NewId
  snippetBuilder: StepDefinitionSnippetBuilder
  pickleStep: PickleStep
}): Suggestion {
  const keywordType = mapPickleStepTypeToKeywordType(pickleStep.type)
  const codes = snippetBuilder.buildMultiple({ keywordType, pickleStep })
  const snippets = codes.map((code) => ({
    code,
    language: 'javascript',
  }))

  return {
    id: newId(),
    pickleStepId: pickleStep.id,
    snippets,
  }
}
