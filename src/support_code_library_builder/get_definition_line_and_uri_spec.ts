import assert from 'assert'
import { getDefinitionLineAndUri } from './get_definition_line_and_uri'

describe(getDefinitionLineAndUri.name, () => {
  it('correctly gets the filename of the caller', () => {
    const includeAnyFile = (): boolean => false
    const { uri, line } = getDefinitionLineAndUri('.', includeAnyFile)
    assert.strictEqual(
      uri,
      'src/support_code_library_builder/get_definition_line_and_uri_spec.ts'
    )
    assert.strictEqual(line, 7)
  })
})
