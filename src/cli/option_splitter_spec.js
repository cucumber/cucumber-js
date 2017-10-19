import OptionSplitter from './option_splitter'

describe('OptionSplitter', function() {
  const examples = [
    {
      description: "doesn't split when nothing to split on",
      input: '../custom/formatter',
      output: ['../custom/formatter']
    },
    {
      description: 'splits relative unix paths',
      input: '../custom/formatter:../formatter/output.txt',
      output: ['../custom/formatter', '../formatter/output.txt']
    },
    {
      description: 'splits absolute unix paths',
      input: '/custom/formatter:/formatter/output.txt',
      output: ['/custom/formatter', '/formatter/output.txt']
    },
    {
      description: 'splits absolute windows paths',
      input: 'C:\\custom\\formatter:C:\\formatter\\output.txt',
      output: ['C:\\custom\\formatter', 'C:\\formatter\\output.txt']
    },
    {
      description: 'does not split a single absolute windows paths',
      input: 'C:\\custom\\formatter',
      output: ['C:\\custom\\formatter']
    },
    {
      description: 'splits extensions and modules',
      input: 'ts:typescript',
      output: ['ts', 'typescript']
    },
    {
      description: 'splits extension and module with an absolute windows path',
      input: 'ts:C:/typescript',
      output: ['ts', 'C:/typescript']
    },
    {
      description: 'splits more than 2 parts',
      input: 'part1:part2:part3',
      output: ['part1', 'part2', 'part3']
    }
  ]

  examples.forEach(({ description, input, output }) => {
    it(description, function() {
      expect(OptionSplitter.split(input)).to.eql(output)
    })
  })
})
