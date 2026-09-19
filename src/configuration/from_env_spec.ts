import { expect } from 'chai'
import { FakeLogger } from '../../test/fake_logger'
import { fromEnv } from './from_env'

describe('fromEnv', () => {
  it('should return empty config when no relevant env vars are set', () => {
    const result = fromEnv(new FakeLogger(), {})
    expect(result).to.deep.eq({})
  })

  it('should ignore env vars without the CUCUMBER_OPTION_ prefix', () => {
    const result = fromEnv(new FakeLogger(), {
      TAGS: '@foo',
      CUCUMBER_PUBLISH_ENABLED: 'true',
    })
    expect(result).to.deep.eq({})
  })

  it('should map an env var back to its camelCase configuration key', () => {
    const result = fromEnv(new FakeLogger(), {
      CUCUMBER_OPTION_RETRY_TAG_FILTER: '@flaky',
    })
    expect(result).to.deep.eq({ retryTagFilter: '@flaky' })
  })

  it('should parse boolean values', () => {
    const result = fromEnv(new FakeLogger(), {
      CUCUMBER_OPTION_DRY_RUN: 'true',
      CUCUMBER_OPTION_STRICT: 'false',
    })
    expect(result).to.deep.eq({ dryRun: true, strict: false })
  })

  it('should parse numeric values', () => {
    const result = fromEnv(new FakeLogger(), {
      CUCUMBER_OPTION_PARALLEL: '2',
      CUCUMBER_OPTION_RETRY: '3',
    })
    expect(result).to.deep.eq({ parallel: 2, retry: 3 })
  })

  it('should keep plain string values as strings', () => {
    const result = fromEnv(new FakeLogger(), {
      CUCUMBER_OPTION_TAGS: '@foo and @bar',
      CUCUMBER_OPTION_LANGUAGE: 'en',
    })
    expect(result).to.deep.eq({ tags: '@foo and @bar', language: 'en' })
  })

  it('should parse array values as JSON', () => {
    const result = fromEnv(new FakeLogger(), {
      CUCUMBER_OPTION_PATHS: '["features/**/*.feature"]',
      CUCUMBER_OPTION_FORMAT: '["html:report.html"]',
    })
    expect(result).to.deep.eq({
      paths: ['features/**/*.feature'],
      format: ['html:report.html'],
    })
  })

  it('should parse object values as JSON', () => {
    const result = fromEnv(new FakeLogger(), {
      CUCUMBER_OPTION_WORLD_PARAMETERS: '{"foo":"bar"}',
    })
    expect(result).to.deep.eq({ worldParameters: { foo: 'bar' } })
  })

  it('should ignore CUCUMBER_OPTION_ vars that do not map to a known option', () => {
    const result = fromEnv(new FakeLogger(), {
      CUCUMBER_OPTION_NOT_A_REAL_OPTION: 'whatever',
    })
    expect(result).to.deep.eq({})
  })

  it('should fail validation for a value of the wrong type', () => {
    expect(() =>
      fromEnv(new FakeLogger(), {
        CUCUMBER_OPTION_PARALLEL: 'not-a-number',
      })
    ).to.throw(/failed schema validation/)
  })
})
