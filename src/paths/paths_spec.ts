import { promisify } from 'node:util'
import path from 'node:path'
import tmp, { DirOptions } from 'tmp'
import fsExtra from 'fs-extra'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { FakeLogger } from '../../test/fake_logger'
import { ILogger } from '../logger'
import { resolvePaths } from './paths'

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
      const { sourcePaths, unexpandedSourcePaths, requirePaths, importPaths } =
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
            loaders: [],
          }
        )

      // Assert
      expect(sourcePaths).to.eql([featurePath])
      expect(unexpandedSourcePaths).to.eql([relativeFeaturePath])
      expect(requirePaths).to.eql([])
      expect(importPaths).to.eql([jsSupportCodePath, esmSupportCodePath])
    })

    it('deduplicates features based on overlapping expressions', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      // Act
      const { sourcePaths } = await resolvePaths(
        new FakeLogger(),
        cwd,
        {
          paths: ['features/*.feature', 'features/a.feature'],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
          loaders: [],
        }
      )

      // Assert
      expect(sourcePaths).to.eql([featurePath])
    })

    it('deduplicates features based on multiple targets of same path', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      // Act
      const { sourcePaths } = await resolvePaths(
        new FakeLogger(),
        cwd,
        {
          paths: [`${relativeFeaturePath}:3`, `${relativeFeaturePath}:4`],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
          loaders: [],
        }
      )

      // Assert
      expect(sourcePaths).to.eql([featurePath])
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
      const { sourcePaths, unexpandedSourcePaths, importPaths } =
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
            loaders: [],
          }
        )

      // Assert
      expect(sourcePaths).to.eql([featurePath])
      expect(unexpandedSourcePaths).to.eql([relativeFeaturePath])
      expect(importPaths).to.eql([supportCodePath])
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
      const { sourcePaths, unexpandedSourcePaths, importPaths } =
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
            loaders: [],
          }
        )

      // Assert
      expect(sourcePaths).to.eql([featurePath])
      expect(unexpandedSourcePaths).to.eql([relativeFeaturePath])
      expect(importPaths).to.eql([supportCodePath])
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
      const { sourcePaths, unexpandedSourcePaths, importPaths } =
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
            loaders: [],
          }
        )

      // Assert
      expect(sourcePaths).to.eql([featurePath])
      expect(unexpandedSourcePaths).to.eql([relativeFeaturePath])
      expect(importPaths).to.eql([supportCodePath])
    })
  })

  describe('multiple paths ordering', async () => {
    it('should honour the provided order of multiple files', async () => {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const featurePathA = path.join(cwd, 'features', 'a.feature')
      const featurePathB = path.join(cwd, 'features', 'b.feature')
      await fsExtra.outputFile(featurePathA, '')
      await fsExtra.outputFile(featurePathB, '')
      // Act
      const { sourcePaths } = await resolvePaths(
        new FakeLogger(),
        cwd,
        {
          paths: ['features/b.feature', 'features/a.feature'],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
          loaders: [],
        }
      )

      // Assert
      expect(sourcePaths).to.eql([featurePathB, featurePathA])
    })

    it('should honour the provided order of multiple directories', async () => {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const featurePathA = path.join(cwd, 'features-a', 'something.feature')
      const featurePathB = path.join(cwd, 'features-b', 'something.feature')
      await fsExtra.outputFile(featurePathA, '')
      await fsExtra.outputFile(featurePathB, '')
      // Act
      const { sourcePaths } = await resolvePaths(
        new FakeLogger(),
        cwd,
        {
          paths: ['features-b', 'features-a'],
        },
        {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
          loaders: [],
        }
      )

      // Assert
      expect(sourcePaths).to.eql([featurePathB, featurePathA])
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
      const { sourcePaths, unexpandedSourcePaths, requirePaths } =
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
            loaders: [],
          }
        )

      // Assert
      expect(sourcePaths).to.eql([])
      expect(unexpandedSourcePaths).to.eql([])
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
      const { sourcePaths, unexpandedSourcePaths, requirePaths } =
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
            loaders: [],
          }
        )

      // Assert
      expect(sourcePaths).to.eql([])
      expect(unexpandedSourcePaths).to.eql([])
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
      const { sourcePaths, unexpandedSourcePaths, requirePaths } =
        await resolvePaths(
          new FakeLogger(),
          cwd,
          { paths: [relativeRerunPath] },
          {
            requireModules: [],
            requirePaths: [],
            importPaths: [],
            loaders: [],
          }
        )

      // Assert
      expect(sourcePaths).to.eql([])
      expect(unexpandedSourcePaths).to.eql([])
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
      const cjsSupportCodePath = path.join(cwd, 'features', 'a.cjs')
      await fsExtra.outputFile(cjsSupportCodePath, '')
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
          requirePaths: [cjsSupportCodePath],
          importPaths: [esmSupportCodePath],
          loaders: [],
        }
      )

      // Assert
      expect(logger.debug).to.have.been.calledWith(
        'Found source files based on configuration:',
        [featurePath]
      )
      expect(logger.debug).to.have.been.calledWith(
        'Found support files to load via `require` based on configuration:',
        [cjsSupportCodePath]
      )
      expect(logger.debug).to.have.been.calledWith(
        'Found support files to load via `import` based on configuration:',
        [esmSupportCodePath]
      )
    })
  })
})
