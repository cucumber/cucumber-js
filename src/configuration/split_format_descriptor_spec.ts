import { describe, it } from 'mocha'
import { expect } from 'chai'
import { splitFormatDescriptor } from './split_format_descriptor'

describe('splitFormatDescriptor', () => {
  const examples = [
    {
      description: "doesn't split when nothing to split on, adds empty string",
      input: '../custom/formatter',
      output: ['../custom/formatter', ''],
    },
    {
      description: 'splits a bare name and target on the colon',
      input: 'html:report.html',
      output: ['html', 'report.html'],
    },
    {
      description: 'splits relative unix paths',
      input: '../custom/formatter:../formatter/output.txt',
      output: ['../custom/formatter', '../formatter/output.txt'],
    },
    {
      description: 'splits relative windows paths',
      input: '..\\custom\\formatter:..\\formatter\\output.txt',
      output: ['..\\custom\\formatter', '..\\formatter\\output.txt'],
    },
    {
      description: 'splits absolute unix paths',
      input: '/custom/formatter:/formatter/output.txt',
      output: ['/custom/formatter', '/formatter/output.txt'],
    },
    {
      description: 'splits UNC paths',
      input:
        '\\\\hostname\\custom\\formatter:\\\\hostname\\formatter\\output.txt',
      output: [
        '\\\\hostname\\custom\\formatter',
        '\\\\hostname\\formatter\\output.txt',
      ],
    },
    {
      description: 'splits UNC paths with "/" as directory separator',
      input: '//hostname/custom/formatter://hostname/formatter/output.txt',
      output: [
        '//hostname/custom/formatter',
        '//hostname/formatter/output.txt',
      ],
    },
    {
      description: 'splits a bare name and quoted target',
      input: '/custom/formatter:"/formatter directory/output.txt"',
      output: ['/custom/formatter', '/formatter directory/output.txt'],
    },
    {
      description: 'does not split fully quoted parts: "foo":"bar"',
      input: '"foo:bar":"baz:qux"',
      output: ['foo:bar', 'baz:qux'],
    },
    {
      description: 'does not split a single quoted value, adds empty string',
      input: '"foo:bar:baz:qux"',
      output: ['foo:bar:baz:qux', ''],
    },
    {
      description: 'uses quoting to keep a file:// formatter and target intact',
      input: '"html":"file://hostname/formatter/report.html"',
      output: ['html', 'file://hostname/formatter/report.html'],
    },
    {
      description:
        'uses quoting to keep a single file:// formatter intact, adds empty string',
      input: '"file://C:\\custom\\formatter"',
      output: ['file://C:\\custom\\formatter', ''],
    },
    {
      description:
        'splits an unquoted file URL on its only colon (now requires quoting)',
      input: 'file:///custom/formatter',
      output: ['file', '///custom/formatter'],
    },
  ]

  examples.forEach(({ description, input, output }) => {
    it(description, () => {
      expect(splitFormatDescriptor(input)).to.eql(output)
    })
  })

  const ambiguous = [
    {
      description: 'throws when a bare name and target both contain colons',
      input: 'foo:bar:baz:qux',
    },
    {
      description:
        'throws when a quoted name is followed by a bare target with colons',
      input: '"foo:bar":baz:qux',
    },
    {
      description:
        'throws when a bare name with colons precedes a quoted target',
      input: 'foo:bar:"baz:qux"',
    },
  ]

  ambiguous.forEach(({ description, input }) => {
    it(description, () => {
      expect(() => splitFormatDescriptor(input)).to.throw(
        `Could not parse "${input}"`
      )
    })
  })
})
