import { expect } from 'chai'
import FormatterBuilder from './builder'
import { pathToFileURL } from 'url'
import path from 'path'

describe('custom class loading', () => {
  it('should handle a file:// url', async () => {
    const fileUrl = pathToFileURL(
      path.resolve(__dirname, './fixtures/module_dot_exports.cjs')
    ).toString()
    const CustomClass = await FormatterBuilder.loadCustomClass(
      'formatter',
      fileUrl,
      __dirname
    )

    expect(typeof CustomClass).to.eq('function')
  })

  it('should handle cjs module.exports', async () => {
    const CustomClass = await FormatterBuilder.loadCustomClass(
      'formatter',
      './fixtures/module_dot_exports.cjs',
      __dirname
    )

    expect(typeof CustomClass).to.eq('function')
  })

  it('should handle cjs exports.default', async () => {
    const CustomClass = await FormatterBuilder.loadCustomClass(
      'formatter',
      './fixtures/exports_dot_default.cjs',
      __dirname
    )

    expect(typeof CustomClass).to.eq('function')
  })

  it('should handle esm default export', async () => {
    const CustomClass = await FormatterBuilder.loadCustomClass(
      'formatter',
      './fixtures/esm.mjs',
      __dirname
    )

    expect(typeof CustomClass).to.eq('function')
  })
})
