import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { expect } from 'chai'
import { resolveImplementation } from './resolve_implementation'

describe('resolveImplementation', () => {
  const varieties = [
    'esm.mjs',
    'exports_dot_default.cjs',
    'module_dot_exports.cjs',
  ]

  describe('legacy classes', () => {
    varieties.forEach((filename) => {
      describe(filename, () => {
        it('should handle a relative path', async () => {
          const CustomClass = await resolveImplementation(
            `./fixtures/legacy_${filename}`,
            __dirname
          )

          expect(typeof CustomClass).to.eq('function')
        })

        it('should handle a file:// url', async () => {
          const fileUrl = pathToFileURL(
            path.resolve(__dirname, `./fixtures/legacy_${filename}`)
          ).toString()
          const CustomClass = await resolveImplementation(fileUrl, __dirname)

          expect(typeof CustomClass).to.eq('function')
        })
      })
    })
  })

  describe('plugins', () => {
    varieties.forEach((filename) => {
      describe(filename, () => {
        it('should handle a relative path', async () => {
          const plugin = await resolveImplementation(
            `./fixtures/plugin_${filename}`,
            __dirname
          )

          expect(typeof plugin).to.eq('object')
        })

        it('should handle a file:// url', async () => {
          const fileUrl = pathToFileURL(
            path.resolve(__dirname, `./fixtures/plugin_${filename}`)
          ).toString()
          const plugin = await resolveImplementation(fileUrl, __dirname)

          expect(typeof plugin).to.eq('object')
        })
      })
    })
  })
})
