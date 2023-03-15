import { promisify } from 'util'
import tmp, { DirOptions } from 'tmp'
import fsExtra from 'fs-extra'
import path from 'path'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { resolvePaths } from './paths'
import { FakeLogger } from '../../test/fake_logger'
import { ILogger } from '../logger'

async function buildTestWorkingDirectory(): Promise<string> {
  const cwd = await promisify<DirOptions, string>(tmp.dir)({
    unsafeCleanup: true,
  })
  await fsExtra.mkdirp(path.join(cwd, 'features'))
  return cwd
}

describe('resolvePaths', () => {
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

      // Act
      const {
        featurePaths,
        unexpandedFeaturePaths,
        requirePaths,
        importPaths,
      } = await resolvePaths(
        new FakeLogger(),
        cwd,
        {
          paths: [relativeFeaturePath],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
        }
      )

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
      expect(requirePaths).to.eql([jsSupportCodePath])
      expect(importPaths).to.eql([esmSupportCodePath])
    })

    it('deduplicates features based on overlapping expressions', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      // Act
      const { featurePaths } = await resolvePaths(
        new FakeLogger(),
        cwd,
        {
          paths: ['features/*.feature', 'features/a.feature'],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
        }
      )

      // Assert
      expect(featurePaths).to.eql([featurePath])
    })

    it('deduplicates features based on multiple targets of same path', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      // Act
      const { featurePaths } = await resolvePaths(
        new FakeLogger(),
        cwd,
        {
          paths: [`${relativeFeaturePath}:3`, `${relativeFeaturePath}:4`],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
        }
      )

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

      // Act
      const { featurePaths, unexpandedFeaturePaths, requirePaths } =
        await resolvePaths(
          new FakeLogger(),
          cwd,
          {
            paths: [relativeFeaturePath],
          },
          {
            requireModules: [],
            requirePaths: [],
            importPaths: [],
          }
        )

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
      expect(requirePaths).to.eql([supportCodePath])
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

      // Act
      const { featurePaths, unexpandedFeaturePaths, requirePaths } =
        await resolvePaths(
          new FakeLogger(),
          cwd,
          {
            paths: [relativeFeaturePath],
          },
          {
            requireModules: [],
            requirePaths: [],
            importPaths: [],
          }
        )

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
      expect(requirePaths).to.eql([supportCodePath])
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

      // Act
      const { featurePaths, unexpandedFeaturePaths, requirePaths } =
        await resolvePaths(
          new FakeLogger(),
          cwd,
          {
            paths: [relativeFeaturePath],
          },
          {
            requireModules: [],
            requirePaths: [],
            importPaths: [],
          }
        )

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
      expect(requirePaths).to.eql([supportCodePath])
    })
  })

  describe('path to an empty rerun file', () => {
    it('returns empty featurePaths and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()

      const relativeRerunPath = '@empty_rerun.txt'
      const rerunPath = path.join(cwd, '@empty_rerun.txt')
      await fsExtra.outputFile(rerunPath, '')
      // Act
      const { featurePaths, unexpandedFeaturePaths, requirePaths } =
        await resolvePaths(
          new FakeLogger(),
          cwd,
          {
            paths: [relativeRerunPath],
          },
          {
            requireModules: [],
            requirePaths: [],
            importPaths: [],
          }
        )

      // Assert
      expect(featurePaths).to.eql([])
      expect(unexpandedFeaturePaths).to.eql([])
      expect(requirePaths).to.eql([])
    })
  })

  describe('path to an rerun file with new line', () => {
    it('returns empty featurePaths and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()

      const relativeRerunPath = '@empty_rerun.txt'
      const rerunPath = path.join(cwd, '@empty_rerun.txt')
      await fsExtra.outputFile(rerunPath, '\n')
      // Act
      const { featurePaths, unexpandedFeaturePaths, requirePaths } =
        await resolvePaths(
          new FakeLogger(),
          cwd,
          {
            paths: [relativeRerunPath],
          },
          {
            requireModules: [],
            requirePaths: [],
            importPaths: [],
          }
        )

      // Assert
      expect(featurePaths).to.eql([])
      expect(unexpandedFeaturePaths).to.eql([])
      expect(requirePaths).to.eql([])
    })
  })

  describe('path to a rerun file with one new line character', () => {
    it('returns empty featurePaths and support code paths', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()

      const relativeRerunPath = '@empty_rerun.txt'
      const rerunPath = path.join(cwd, '@empty_rerun.txt')
      await fsExtra.outputFile(rerunPath, '\n\n')

      // Act
      const { featurePaths, unexpandedFeaturePaths, requirePaths } =
        await resolvePaths(
          new FakeLogger(),
          cwd,
          { paths: [relativeRerunPath] },
          {
            requireModules: [],
            requirePaths: [],
            importPaths: [],
          }
        )

      // Assert
      expect(featurePaths).to.eql([])
      expect(unexpandedFeaturePaths).to.eql([])
      expect(requirePaths).to.eql([])
    })
  })

  describe('logging', () => {
    it('should emit debugs logs for the feature, import and require paths', async () => {
      // Arrange
      const logger: ILogger = new FakeLogger()
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      const jsSupportCodePath = path.join(cwd, 'features', 'a.js')
      await fsExtra.outputFile(jsSupportCodePath, '')
      const esmSupportCodePath = path.join(cwd, 'features', 'a.mjs')
      await fsExtra.outputFile(esmSupportCodePath, '')

      // Act
      await resolvePaths(
        logger,
        cwd,
        {
          paths: [relativeFeaturePath],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
        }
      )

      // Assert
      expect(logger.debug).to.have.been.calledWith(
        'Found feature files based on configuration:',
        [featurePath]
      )
      expect(logger.debug).to.have.been.calledWith(
        'Found support files to load via `require` based on configuration:',
        [jsSupportCodePath]
      )
      expect(logger.debug).to.have.been.calledWith(
        'Found support files to load via `import` based on configuration:',
        [esmSupportCodePath]
      )
    })
  })
})
