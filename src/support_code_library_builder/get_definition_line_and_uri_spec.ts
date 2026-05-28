import assert from 'node:assert'
import path from 'node:path'
import { getDefinitionLineAndUri } from './get_definition_line_and_uri'

describe(getDefinitionLineAndUri.name, () => {
  const isExcluded = (fileName: string): boolean =>
    fileName.includes('get_definition_line_and_uri_spec')

  it('correctly gets the relative filename and line of the caller when cjs', async () => {
    const { wrap } = (await import(
      // @ts-expect-error sample fixture
      './get_definition_line_and_uri_sample.cjs'
    )) as {
      wrap: <T>(fn: () => T) => T
    }

    const { uri, line } = wrap(() => getDefinitionLineAndUri('.', isExcluded))
    assert.strictEqual(
      path.normalize(uri),
      path.normalize(
        'src/support_code_library_builder/get_definition_line_and_uri_sample.cjs'
      )
    )
    assert.strictEqual(line, 3)
  })

  it('correctly gets the relative filename and line of the caller when esm', async () => {
    const { wrap } = (await import(
      // @ts-expect-error sample fixture
      './get_definition_line_and_uri_sample.mjs'
    )) as {
      wrap: <T>(fn: () => T) => T
    }
    const { uri, line } = wrap(() => getDefinitionLineAndUri('.', isExcluded))
    assert.strictEqual(
      path.normalize(uri),
      path.normalize(
        'src/support_code_library_builder/get_definition_line_and_uri_sample.mjs'
      )
    )
    assert.strictEqual(line, 3)
  })
})
