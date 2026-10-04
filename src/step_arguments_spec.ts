import { expect } from 'chai'
import { describe, it } from 'mocha'
import { parseStepArguments } from './step_arguments'

describe('parseStepArguments', () => {
  const mapping = {
    dataTable: () => 'dataTable',
    docString: () => 'docString',
  }

  it('returns nothing when there is no argument', () => {
    expect(parseStepArguments(undefined, mapping)).to.eql([])
  })

  it('returns arguments in the order of their argument index', () => {
    expect(
      parseStepArguments(
        {
          dataTable: { argumentIndex: 2, rows: [] },
          docString: { argumentIndex: 1, content: 'content' },
        },
        mapping
      )
    ).to.eql(['docString', 'dataTable'])
  })

  it('puts the data table first when there are no argument indexes', () => {
    expect(
      parseStepArguments(
        {
          dataTable: { rows: [] },
          docString: { content: 'content' },
        },
        mapping
      )
    ).to.eql(['dataTable', 'docString'])
  })
})
