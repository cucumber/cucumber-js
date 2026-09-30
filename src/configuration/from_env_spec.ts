import { expect } from 'chai'
import { fromEnvironment } from './from_env'

describe('fromEnvironment', () => {
  it('should return empty configuration when no environment variables are provided', () => {
    expect(fromEnvironment({})).to.deep.eq({})
  })

  it('should read parallel from the environment', () => {
    expect(fromEnvironment({ CUCUMBER_PARALLEL: '4' })).to.deep.eq({
      parallel: 4,
    })
  })

  it('should read boolean values from the environment', () => {
    expect(fromEnvironment({ CUCUMBER_STRICT: 'false' })).to.deep.eq({
      strict: false,
    })
  })

  it('should read string values from the environment', () => {
    expect(fromEnvironment({ CUCUMBER_TAGS: '@smoke' })).to.deep.eq({
      tags: '@smoke',
    })
  })

  it('should read array values from the environment', () => {
    expect(
      fromEnvironment({
        CUCUMBER_FORMAT: '["progress", "json:report.json"]',
      })
    ).to.deep.eq({
      format: ['progress', 'json:report.json'],
    })
  })

  it('should read object values from the environment', () => {
    expect(
      fromEnvironment({
        CUCUMBER_WORLD_PARAMETERS: '{"role":"admin","debug":true}',
      })
    ).to.deep.eq({
      worldParameters: {
        role: 'admin',
        debug: true,
      },
    })
  })

  it('should preserve non-JSON values as strings', () => {
    expect(
      fromEnvironment({
        CUCUMBER_TAGS: '@smoke and @login',
      })
    ).to.deep.eq({
      tags: '@smoke and @login',
    })
  })

  it('should ignore unknown environment variables', () => {
    expect(
      fromEnvironment({
        CUCUMBER_SOMETHING_UNKNOWN: 'value',
      })
    ).to.deep.eq({})
  })
})