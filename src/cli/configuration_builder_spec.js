import { promisify } from 'bluebird'
import ConfigurationBuilder from './configuration_builder'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

const outputFile = promisify(fsExtra.outputFile)

describe('Configuration', function() {
  beforeEach(async function() {
    this.tmpDir = await promisify(tmp.dir)({ unsafeCleanup: true })
    await promisify(fsExtra.mkdirp)(path.join(this.tmpDir, 'features'))
    this.argv = ['path/to/node', 'path/to/cucumber.js']
    this.configurationOptions = {
      argv: this.argv,
      cwd: this.tmpDir
    }
  })

  describe('no argv', function() {
    beforeEach(async function() {
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the default configuration', function() {
      expect(this.result).to.eql({
        featureDefaultLanguage: '',
        featurePaths: [],
        formatOptions: {
          colorsEnabled: true,
          cwd: this.tmpDir
        },
        formats: [{ outputTo: '', type: 'progress' }],
        listI18nKeywordsFor: '',
        listI18nLanguages: false,
        pickleFilterOptions: {
          featurePaths: ['features'],
          names: [],
          tagExpression: ''
        },
        profiles: [],
        runtimeOptions: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          strict: true,
          worldParameters: {}
        },
        supportCodePaths: []
      })
    })
  })

  describe('path to a feature', function() {
    beforeEach(async function() {
      this.relativeFeaturePath = path.join('features', 'a.feature')
      this.featurePath = path.join(this.tmpDir, this.relativeFeaturePath)
      await outputFile(this.featurePath, '')
      this.supportCodePath = path.join(this.tmpDir, 'features', 'a.js')
      await outputFile(this.supportCodePath, '')
      this.argv.push(this.relativeFeaturePath)
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the appropriate feature and support code paths', async function() {
      const {
        featurePaths,
        pickleFilterOptions,
        supportCodePaths
      } = this.result
      expect(featurePaths).to.eql([this.featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([
        this.relativeFeaturePath
      ])
      expect(supportCodePaths).to.eql([this.supportCodePath])
    })
  })

  describe('path to a nested feature', function() {
    beforeEach(async function() {
      this.relativeFeaturePath = path.join('features', 'nested', 'a.feature')
      this.featurePath = path.join(this.tmpDir, this.relativeFeaturePath)
      await outputFile(this.featurePath, '')
      this.supportCodePath = path.join(this.tmpDir, 'features', 'a.js')
      await outputFile(this.supportCodePath, '')
      this.argv.push(this.relativeFeaturePath)
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the appropriate feature and support code paths', async function() {
      const {
        featurePaths,
        pickleFilterOptions,
        supportCodePaths
      } = this.result
      expect(featurePaths).to.eql([this.featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([
        this.relativeFeaturePath
      ])
      expect(supportCodePaths).to.eql([this.supportCodePath])
    })
  })

  describe('formatters', function() {
    it('adds a default', async function() {
      const formats = await getFormats(this.configurationOptions)
      expect(formats).to.eql([{ outputTo: '', type: 'progress' }])
    })

    it('splits relative unix paths', async function() {
      this.argv.push('-f', '../custom/formatter:../formatter/output.txt')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        { outputTo: '../formatter/output.txt', type: '../custom/formatter' }
      ])
    })

    it('splits absolute unix paths', async function() {
      this.argv.push('-f', '/custom/formatter:/formatter/output.txt')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        { outputTo: '/formatter/output.txt', type: '/custom/formatter' }
      ])
    })

    it('splits absolute windows paths', async function() {
      this.argv.push('-f', 'C:\\custom\\formatter:D:\\formatter\\output.txt')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        { outputTo: 'D:\\formatter\\output.txt', type: 'C:\\custom\\formatter' }
      ])
    })

    it('does not split absolute windows paths without an output', async function() {
      this.argv.push('-f', 'C:\\custom\\formatter')
      const formats = await getFormats(this.configurationOptions)

      expect(formats).to.eql([{ outputTo: '', type: 'C:\\custom\\formatter' }])
    })

    async function getFormats(options) {
      const result = await ConfigurationBuilder.build(options)
      return result.formats
    }
  })
})
