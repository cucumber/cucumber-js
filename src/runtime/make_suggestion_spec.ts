import { describe, it } from 'mocha'
import { expect } from 'chai'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import FormatterBuilder from '../formatter/builder'
import { makeSuggestion } from './make_suggestion'

describe('makeSuggestion', () => {
  it('generates multiple snippets for expressions with numeric parameters', async () => {
    const supportCodeLibrary = buildSupportCodeLibrary()
    const snippetBuilder = await FormatterBuilder.getStepDefinitionSnippetBuilder({
      cwd: process.cwd(),
      supportCodeLibrary,
    })
    const newId = IdGenerator.incrementing()
    const pickleStep: messages.PickleStep = {
      id: '1',
      text: 'I have 5 apples',
      type: messages.PickleStepType.CONTEXT,
      astNodeIds: [],
    }

    const suggestion = makeSuggestion({
      newId,
      snippetBuilder,
      pickleStep,
    })

    expect(suggestion).to.deep.equal({
      id: '0',
      pickleStepId: '1',
      snippets: [
        {
          code: "Given('I have {int} apples', function (int) {\n  // Write code here that turns the phrase above into concrete actions\n  return 'pending';\n});",
          language: 'javascript',
        },
        {
          code: "Given('I have {float} apples', function (float) {\n  // Write code here that turns the phrase above into concrete actions\n  return 'pending';\n});",
          language: 'javascript',
        },
      ],
    })
  })
})
