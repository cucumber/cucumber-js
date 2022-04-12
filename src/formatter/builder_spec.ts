import { expect } from 'chai'
import FormatterBuilder from './builder'
import { pathToFileURL } from 'url'
import path from 'path'

describe('custom class loading', () => {
  const varieties = [
    'esm.mjs',
    'exports_dot_default.cjs',
    'module_dot_exports.cjs',
    'typescript.ts',
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
