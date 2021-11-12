import assert from 'assert'
import { getDefinitionLineAndUri } from './get_definition_line_and_uri'
import path from 'path'

describe(getDefinitionLineAndUri.name, () => {
  it('correctly gets the filename of the caller', () => {
    const includeAnyFile = (): boolean => false
    const { uri, line } = getDefinitionLineAndUri('.', includeAnyFile)
    assert.strictEqual(
      path.normalize(uri),
      path.normalize(
        'src/support_code_library_builder/get_definition_line_and_uri_spec.ts'
      )
    )
    assert.strictEqual(line, 8)
  })
})
