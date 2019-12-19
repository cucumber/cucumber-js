import { describe, it } from 'mocha'
import { expect } from 'chai'
import OptionSplitter from './option_splitter'

describe('OptionSplitter', () => {
  const examples = [
    {
      description: "doesn't split when nothing to split on",
      input: '../custom/formatter',
      output: ['../custom/formatter'],
    },
    {
      description: 'splits relative unix paths',
      input: '../custom/formatter:../formatter/output.txt',
      output: ['../custom/formatter', '../formatter/output.txt'],
    },
    {
      description: 'splits absolute unix paths',
      input: '/custom/formatter:/formatter/output.txt',
      output: ['/custom/formatter', '/formatter/output.txt'],
    },
    {
      description: 'splits absolute windows paths',
      input: 'C:\\custom\\formatter:C:\\formatter\\output.txt',
      output: ['C:\\custom\\formatter', 'C:\\formatter\\output.txt'],
    },
    {
      description: 'does not split a single absolute windows paths',
      input: 'C:\\custom\\formatter',
      output: ['C:\\custom\\formatter'],
    },
  ]

  examples.forEach(({ description, input, output }) => {
    it(description, () => {
      expect(OptionSplitter.split(input)).to.eql(output)
    })
  })
})
