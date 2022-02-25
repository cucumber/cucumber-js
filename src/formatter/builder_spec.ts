import { expect } from 'chai'
import FormatterBuilder from './builder'

describe('custom class loading', () => {
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
