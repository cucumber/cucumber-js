import { describe, it } from 'mocha'
import { expect } from 'chai'
import { FakeLogger } from '../../test/fake_logger'
import { splitFormatDescriptor } from './split_format_descriptor'

describe('splitFormatDescriptor', () => {
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
      description: 'splits relative windows paths',
      input: '..\\custom\\formatter:..\\formatter\\output.txt',
      output: ['..\\custom\\formatter', '..\\formatter\\output.txt'],
    },
    {
      description: 'splits file URLs for absolute unix path',
      input: 'file:///custom/formatter:file:///formatter/output.txt',
      output: ['file:///custom/formatter', 'file:///formatter/output.txt'],
      warning:
        'Change to "file:///custom/formatter":"file:///formatter/output.txt"',
    },
    {
      description: 'splits file URLs for UNC path',
      input:
        'file://hostname/custom/formatter:file://hostname/formatter/output.txt',
      output: [
        'file://hostname/custom/formatter',
        'file://hostname/formatter/output.txt',
      ],
      warning:
        'Change to "file://hostname/custom/formatter":"file://hostname/formatter/output.txt"',
    },
    {
      description: 'splits file URLs for absolute windows path',
      input: 'file://C:\\custom\\formatter:file://C:\\formatter\\output.txt',
      output: [
        'file://C:\\custom\\formatter',
        'file://C:\\formatter\\output.txt',
      ],
      warning:
        'Change to "file://C:\\custom\\formatter":"file://C:\\formatter\\output.txt"',
    },
    {
      description:
        'splits file URLs for absolute windows path with "/" as directory separator',
      input: 'file:///C:/custom/formatter:file:///C:/formatter/output.txt',
      output: [
        'file:///C:/custom/formatter',
        'file:///C:/formatter/output.txt',
      ],
      warning:
        'Change to "file:///C:/custom/formatter":"file:///C:/formatter/output.txt"',
    },
    {
      description: 'splits valid file URLs for absolute windows path',
      input: 'file:///C:\\custom\\formatter:file:///C:\\formatter\\output.txt',
      output: [
        'file:///C:\\custom\\formatter',
        'file:///C:\\formatter\\output.txt',
      ],
      warning:
        'Change to "file:///C:\\custom\\formatter":"file:///C:\\formatter\\output.txt"',
    },
    {
      description:
        'splits valid file URLs for absolute windows path with "/" as directory separator',
      input: 'file:///C:/custom/formatter:file:///C:/formatter/output.txt',
      output: [
        'file:///C:/custom/formatter',
        'file:///C:/formatter/output.txt',
      ],
      warning:
        'Change to "file:///C:/custom/formatter":"file:///C:/formatter/output.txt"',
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
      warning: 'Change to "C:\\custom\\formatter":"C:\\formatter\\output.txt"',
    },
    {
      description:
        'splits absolute windows paths with "/" as directory separator',
      input: 'C:/custom/formatter:C:/formatter/output.txt',
      output: ['C:/custom/formatter', 'C:/formatter/output.txt'],
      warning: 'Change to "C:/custom/formatter":"C:/formatter/output.txt"',
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
      description: 'splits paths with quotes around them',
      input: '/custom/formatter:"/formatter directory/output.txt"',
      output: ['/custom/formatter', '/formatter directory/output.txt'],
    },
    {
      description:
        'does not split a single file URL for absolute unix path, adds empty string',
      input: 'file:///custom/formatter',
      output: ['file:///custom/formatter', ''],
      warning: 'Change to "file:///custom/formatter"',
    },
    {
      description:
        'does not split a single file URL for UNC path, adds empty string',
      input: 'file://hostname/custom/formatter',
      output: ['file://hostname/custom/formatter', ''],
      warning: 'Change to "file://hostname/custom/formatter"',
    },
    {
      description:
        'does not split a single file URL for absolute windows path, adds empty string',
      input: 'file://C:\\custom\\formatter',
      output: ['file://C:\\custom\\formatter', ''],
      warning: 'Change to "file://C:\\custom\\formatter"',
    },
    {
      description:
        'does not split a single file URL for absolute windows path with "/" as directory separator, adds empty string',
      input: 'file://C:/custom/formatter',
      output: ['file://C:/custom/formatter', ''],
      warning: 'Change to "file://C:/custom/formatter"',
    },
    {
      description:
        'does not split a valid single file URL for absolute windows path, adds empty string',
      input: 'file:///C:\\custom\\formatter',
      output: ['file:///C:\\custom\\formatter', ''],
      warning: 'Change to "file:///C:\\custom\\formatter"',
    },
    {
      description:
        'does not split a valid single file URL for absolute windows path with "/" as directory separator, adds empty string',
      input: 'file:///C:/custom/formatter',
      output: ['file:///C:/custom/formatter', ''],
      warning: 'Change to "file:///C:/custom/formatter"',
    },
    {
      description:
        'does not split a single absolute windows path, adds empty string',
      input: 'C:\\custom\\formatter',
      output: ['C:\\custom\\formatter', ''],
      warning: 'Change to "C:\\custom\\formatter"',
    },
    {
      description:
        'does not split a single absolute windows path with "/" as directory separator, adds empty string',
      input: 'C:/custom/formatter',
      output: ['C:/custom/formatter', ''],
      warning: 'Change to "C:/custom/formatter"',
    },
    {
      description: 'does not split quoted values: case 1',
      input: '"foo:bar":"baz:qux"',
      output: ['foo:bar', 'baz:qux'],
    },
    {
      description: 'does not split quoted values: case 2',
      input: '"foo:bar":baz:qux',
      output: ['foo:bar', 'baz:qux'],
      warning: 'Change to "foo:bar":"baz:qux"',
    },
    {
      description: 'does not split quoted values: case 3',
      input: 'foo:bar:"baz:qux"',
      output: ['foo:bar', 'baz:qux'],
      warning: 'Change to "foo:bar":"baz:qux"',
    },
    {
      description: 'does not split quoted values: case 4',
      input: '"foo:bar:baz:qux"',
      output: ['foo:bar:baz:qux', ''],
    },
    {
      description: 'splits string contains multiple ":"',
      input: 'foo:bar:baz:qux',
      output: ['foo', 'bar:baz:qux'],
      warning: 'Change to "foo":"bar:baz:qux"',
    },
  ]

  examples.forEach(({ description, input, output, warning }) => {
    it(description, () => {
      const logger = new FakeLogger()
      expect(splitFormatDescriptor(logger, input)).to.eql(output)
      if (warning) {
        expect(logger.warn).to.have.been.called()
        expect(logger.warn.firstCall.firstArg as string).to.contain(warning)
      } else {
        expect(logger.warn).not.to.have.been.called()
      }
    })
  })
})
