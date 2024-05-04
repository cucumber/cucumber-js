import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { expect } from 'chai'
import FormatterBuilder from './builder'

describe('custom class loading', () => {
  const varieties = [
    'legacy_esm.mjs',
    'legacy_exports_dot_default.cjs',
    'legacy_module_dot_exports.cjs',
  ]
  varieties.forEach((filename) => {
    describe(filename, () => {
      it('should handle a relative path', async () => {
        const CustomClass = await FormatterBuilder.loadCustomClass(
          'formatter',
          `./fixtures/${filename}`,
          __dirname
        )

        expect(typeof CustomClass).to.eq('function')
      })

      it('should handle a file:// url', async () => {
        const fileUrl = pathToFileURL(
          path.resolve(__dirname, `./fixtures/${filename}`)
        ).toString()
        const CustomClass = await FormatterBuilder.loadCustomClass(
          'formatter',
          fileUrl,
          __dirname
        )

        expect(typeof CustomClass).to.eq('function')
      })
    })
  })
})
