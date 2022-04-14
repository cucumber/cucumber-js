import { describe, it } from 'mocha'
import { expect } from 'chai'
import { OptionSplitter } from './option_splitter'

describe('OptionSplitter', () => {
  const examples = [
    {
      description: "doesn't split when nothing to split on, adds empty string",
      input: '../custom/formatter',
      output: ['../custom/formatter', ''],
    },
    {
      description: 'splits relative unix paths',
      input: '../custom/formatter:../formatter/output.txt',
      output: ['../custom/formatter', '../formatter/output.txt'],
    },
    {
      description: 'splits absolute unix paths',
      input: 'file:///custom/formatter:file:///formatter/output.txt',
      output: ['file:///custom/formatter', 'file:///formatter/output.txt'],
    },
    {
      description: 'splits paths with quotes around them',
      input: '/custom/formatter:"/formatter directory/output.txt"',
      output: ['/custom/formatter', '/formatter directory/output.txt'],
    },
    {
      description: 'splits absolute windows paths',
      input: 'file://C:\\custom\\formatter:file://C:\\formatter\\output.txt',
      output: [
        'file://C:\\custom\\formatter',
        'file://C:\\formatter\\output.txt',
      ],
    },
    {
      description:
        'does not split a single absolute windows paths, adds empty string',
      input: 'file://C:\\custom\\formatter',
      output: ['file://C:\\custom\\formatter', ''],
    },
  ]

  examples.forEach(({ description, input, output }) => {
    it(description, () => {
      expect(OptionSplitter.split(input)).to.eql(output)
    })
  })
})
