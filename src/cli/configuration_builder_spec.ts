import { describe, it } from 'mocha'
import { expect } from 'chai'
import ConfigurationBuilder, {
  buildConfiguration,
} from './configuration_builder'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp, { DirOptions } from 'tmp'
import { promisify } from 'util'
import { SnippetInterface } from '../formatter/step_definition_snippet_builder/snippet_syntax'
import ArgvParser from './argv_parser'

async function buildTestWorkingDirectory(): Promise<string> {
  const cwd = await promisify<DirOptions, string>(tmp.dir)({
    unsafeCleanup: true,
  })
  await fsExtra.mkdirp(path.join(cwd, 'features'))
  return cwd
}

const baseArgv = ['/path/to/node', '/path/to/cucumber-js']

describe('Configuration', () => {
  describe('buildConfiguration', () => {
    it('should map formatters ', async () => {
      const result = await buildConfiguration(
        ArgvParser.parse([
          ...baseArgv,
          '--format',
          'message',
          '--format',
          'json:./report.json',
          '--format',
          'html:./report.html',
        ]),
        process.env
      )

      expect(result.formats).to.eql({
        stdout: 'message',
        files: new Map([
          ['./report.html', 'html'],
          ['./report.json', 'json'],
        ]),
        publish: false,
        options: {},
      })
    })
  })

  describe('no argv', () => {
    it('returns the default configuration', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv

      // Act
      const result = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(result).to.eql({
        featureDefaultLanguage: 'en',
        featurePaths: [],
        formatOptions: {},
        formats: [{ outputTo: '', type: 'progress' }],
        publishing: false,
        order: 'defined',
        parallel: 0,
        pickleFilterOptions: {
          cwd,
          featurePaths: ['features/**/*.{feature,feature.md}'],
          names: [],
          tagExpression: '',
        },
        profiles: [],
        predictableIds: false,
        runtimeOptions: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          predictableIds: false,
          retry: 0,
          retryTagFilter: '',
          strict: true,
          worldParameters: {},
        },
        shouldExitImmediately: false,
        supportCodePaths: [],
        supportCodeRequiredModules: [],
        suppressPublishAdvertisement: false,
      })
    })
  })

  describe('path to a feature', () => {
    it('returns the appropriate .feature and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      const jsSupportCodePath = path.join(cwd, 'features', 'a.js')
      await fsExtra.outputFile(jsSupportCodePath, '')
      const esmSupportCodePath = path.join(cwd, 'features', 'a.mjs')
      await fsExtra.outputFile(esmSupportCodePath, '')
      const argv = baseArgv.concat([relativeFeaturePath])

      // Act
      const { featurePaths, pickleFilterOptions, supportCodePaths } =
        await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([relativeFeaturePath])
      expect(supportCodePaths).to.eql([jsSupportCodePath, esmSupportCodePath])
    })

    it('deduplicates the .feature files before returning', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      const argv = baseArgv.concat([
        `${relativeFeaturePath}:3`,
        `${relativeFeaturePath}:4`,
      ])

      // Act
      const { featurePaths } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([featurePath])
    })

    it('returns the appropriate .md and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature.md')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      const supportCodePath = path.join(cwd, 'features', 'a.js')
      await fsExtra.outputFile(supportCodePath, '')
      const argv = baseArgv.concat([relativeFeaturePath])

      // Act
      const { featurePaths, pickleFilterOptions, supportCodePaths } =
        await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([relativeFeaturePath])
      expect(supportCodePaths).to.eql([supportCodePath])
    })
  })

  describe('path to a nested feature', () => {
    it('returns the appropriate .feature and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'nested', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      const supportCodePath = path.join(cwd, 'features', 'a.js')
      await fsExtra.outputFile(supportCodePath, '')
      const argv = baseArgv.concat([relativeFeaturePath])

      // Act
      const { featurePaths, pickleFilterOptions, supportCodePaths } =
        await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([relativeFeaturePath])
      expect(supportCodePaths).to.eql([supportCodePath])
    })

    it('returns the appropriate .md and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join(
        'features',
        'nested',
        'a.feature.md'
      )
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      const supportCodePath = path.join(cwd, 'features', 'a.js')
      await fsExtra.outputFile(supportCodePath, '')
      const argv = baseArgv.concat([relativeFeaturePath])

      // Act
      const { featurePaths, pickleFilterOptions, supportCodePaths } =
        await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(pickleFilterOptions.featurePaths).to.eql([relativeFeaturePath])
      expect(supportCodePaths).to.eql([supportCodePath])
    })
  })

  describe('path to an empty rerun file', () => {
    it('returns empty featurePaths and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()

      const relativeRerunPath = '@empty_rerun.txt'
      const rerunPath = path.join(cwd, '@empty_rerun.txt')
      await fsExtra.outputFile(rerunPath, '')
      const argv = baseArgv.concat([relativeRerunPath])

      // Act
      const { featurePaths, pickleFilterOptions, supportCodePaths } =
        await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([])
      expect(pickleFilterOptions.featurePaths).to.eql([])
      expect(supportCodePaths).to.eql([])
    })
  })

  describe('path to an rerun file with new line', () => {
    it('returns empty featurePaths and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()

      const relativeRerunPath = '@empty_rerun.txt'
      const rerunPath = path.join(cwd, '@empty_rerun.txt')
      await fsExtra.outputFile(rerunPath, '\n')
      const argv = baseArgv.concat([relativeRerunPath])

      // Act
      const { featurePaths, pickleFilterOptions, supportCodePaths } =
        await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([])
      expect(pickleFilterOptions.featurePaths).to.eql([])
      expect(supportCodePaths).to.eql([])
    })
  })

  describe('path to a rerun file with one new line character', () => {
    it('returns empty featurePaths and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()

      const relativeRerunPath = '@empty_rerun.txt'
      const rerunPath = path.join(cwd, '@empty_rerun.txt')
      await fsExtra.outputFile(rerunPath, '\n\n')
      const argv = baseArgv.concat([relativeRerunPath])

      // Act
      const { featurePaths, pickleFilterOptions, supportCodePaths } =
        await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(featurePaths).to.eql([])
      expect(pickleFilterOptions.featurePaths).to.eql([])
      expect(supportCodePaths).to.eql([])
    })
  })

  describe('formatters', () => {
    it('adds a default', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv

      // Act
      const { formats } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(formats).to.eql([{ outputTo: '', type: 'progress' }])
    })

    it('adds a message formatter with reports URL when --publish specified', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat(['--publish'])

      // Act
      const { formats } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        {
          outputTo: 'https://messages.cucumber.io/api/reports',
          type: 'message',
        },
      ])
    })

    it('sets publishing to true when --publish is specified', async function () {
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat(['--publish'])
      const configuration = await ConfigurationBuilder.build({ argv, cwd })

      expect(configuration.publishing).to.eq(true)
    })

    it('sets suppressPublishAdvertisement to true when --publish-quiet is specified', async function () {
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat(['--publish-quiet'])
      const configuration = await ConfigurationBuilder.build({ argv, cwd })

      expect(configuration.suppressPublishAdvertisement).to.eq(true)
    })

    it('splits relative unix paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat([
        '-f',
        '../custom/formatter:../formatter/output.txt',
      ])

      // Act
      const { formats } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        { outputTo: '../formatter/output.txt', type: '../custom/formatter' },
      ])
    })

    it('splits absolute unix paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat([
        '-f',
        '/custom/formatter:/formatter/output.txt',
      ])

      // Act
      const { formats } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        { outputTo: '/formatter/output.txt', type: '/custom/formatter' },
      ])
    })

    it('splits absolute windows paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat([
        '-f',
        'C:\\custom\\formatter:D:\\formatter\\output.txt',
      ])

      // Act
      const { formats } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(formats).to.eql([
        { outputTo: '', type: 'progress' },
        {
          outputTo: 'D:\\formatter\\output.txt',
          type: 'C:\\custom\\formatter',
        },
      ])
    })

    it('does not split absolute windows paths without an output', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat(['-f', 'C:\\custom\\formatter'])

      // Act
      const { formats } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(formats).to.eql([{ outputTo: '', type: 'C:\\custom\\formatter' }])
    })
  })

  describe('formatOptions', () => {
    it('joins the objects', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const argv = baseArgv.concat([
        '--format-options',
        '{"snippetInterface": "promise"}',
        '--format-options',
        '{"colorsEnabled": false}',
      ])

      // Act
      const { formatOptions } = await ConfigurationBuilder.build({ argv, cwd })

      // Assert
      expect(formatOptions).to.eql({
        colorsEnabled: false,
        snippetInterface: SnippetInterface.Promise,
      })
    })
  })
})
