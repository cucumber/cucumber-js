import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import ConfigurationBuilder, {
  IConfigurationFormat,
  INewConfigurationBuilderOptions,
} from './configuration_builder'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'
import { promisify } from 'util'

describe('Configuration', () => {
  beforeEach(async function() {
    this.tmpDir = await promisify(tmp.dir)({ unsafeCleanup: true })
    await promisify(fsExtra.mkdirp)(path.join(this.tmpDir, 'features'))
    this.argv = ['path/to/node', 'path/to/cucumber.js']
    this.configurationOptions = {
      argv: this.argv,
      cwd: this.tmpDir,
    }
  })

  describe('no argv', () => {
    beforeEach(async function() {
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the default configuration', function() {
      expect(this.result).to.eql({
        featureDefaultLanguage: 'en',
        featurePaths: [],
        formatOptions: { cwd: this.tmpDir },
        formats: [{ outputTo: '', type: 'progress' }],
        listI18nKeywordsFor: '',
        listI18nLanguages: false,
        order: 'defined',
        parallel: 0,
        pickleFilterOptions: {
          cwd: this.tmpDir,
          featurePaths: ['features/**/*.feature'],
          names: [],
          tagExpression: '',
        },
        profiles: [],
        predictableIds: false,
        runtimeOptions: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          retry: 0,
          retryTagFilter: '',
          strict: true,
          worldParameters: {},
        },
        shouldExitImmediately: false,
        supportCodePaths: [],
        supportCodeRequiredModules: [],
      })
    })
  })

  describe('path to a feature', () => {
    beforeEach(async function() {
      this.relativeFeaturePath = path.join('features', 'a.feature')
      this.featurePath = path.join(this.tmpDir, this.relativeFeaturePath)
      await fsExtra.outputFile(this.featurePath, '')
      this.supportCodePath = path.join(this.tmpDir, 'features', 'a.js')
      await fsExtra.outputFile(this.supportCodePath, '')
      this.argv.push(this.relativeFeaturePath)
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the appropriate feature and support code paths', function() {
      const {
        featurePaths,
        pickleFilterOptions,
        supportCodePaths,
      } = this.result
      expect(featurePaths).to.eql([this.featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([
        this.relativeFeaturePath,
      ])
      expect(supportCodePaths).to.eql([this.supportCodePath])
    })
  })

  describe('path to a nested feature', () => {
    beforeEach(async function() {
      this.relativeFeaturePath = path.join('features', 'nested', 'a.feature')
      this.featurePath = path.join(this.tmpDir, this.relativeFeaturePath)
      await fsExtra.outputFile(this.featurePath, '')
      this.supportCodePath = path.join(this.tmpDir, 'features', 'a.js')
      await fsExtra.outputFile(this.supportCodePath, '')
      this.argv.push(this.relativeFeaturePath)
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the appropriate feature and support code paths', function() {
      const {
        featurePaths,
        pickleFilterOptions,
        supportCodePaths,
      } = this.result
      expect(featurePaths).to.eql([this.featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([
        this.relativeFeaturePath,
      ])
      expect(supportCodePaths).to.eql([this.supportCodePath])
    })
  })

  describe('formatters', () => {
    it('adds a default', async function() {
      const formats = await getFormats(this.configurationOptions)
      expect(formats).to.eql([{ outputTo: '', type: 'progress' }])
    })

    it('splits relative unix paths', async function() {
      this.argv.push('-f', '../custom/formatter:../formatter/output.txt')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        { outputTo: '../formatter/output.txt', type: '../custom/formatter' },
      ])
    })

    it('splits absolute unix paths', async function() {
      this.argv.push('-f', '/custom/formatter:/formatter/output.txt')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        { outputTo: '/formatter/output.txt', type: '/custom/formatter' },
      ])
    })

    it('splits absolute windows paths', async function() {
      this.argv.push('-f', 'C:\\custom\\formatter:D:\\formatter\\output.txt')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        {
          outputTo: 'D:\\formatter\\output.txt',
          type: 'C:\\custom\\formatter',
        },
      ])
    })

    it('does not split absolute windows paths without an output', async function() {
      this.argv.push('-f', 'C:\\custom\\formatter')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([{ outputTo: '', type: 'C:\\custom\\formatter' }])
    })

    async function getFormats(
      options: INewConfigurationBuilderOptions
    ): Promise<IConfigurationFormat[]> {
      const result = await ConfigurationBuilder.build(options)
      return result.formats
    }
  })

  describe('formatOptions', () => {
    it('returns the format options passed in with cwd added', async function() {
      this.argv.push('--format-options', '{"snippetSyntax": "promise"}')
      const result = await ConfigurationBuilder.build(this.configurationOptions)
      expect(result.formatOptions).to.eql({
        snippetSyntax: 'promise',
        cwd: this.tmpDir,
      })
    })
  })
})
