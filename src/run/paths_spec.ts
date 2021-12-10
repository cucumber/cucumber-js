import { promisify } from 'util'
import tmp, { DirOptions } from 'tmp'
import fsExtra from 'fs-extra'
import path from 'path'
import { describe, it } from 'mocha'
import { expect } from 'chai'
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
      const { featurePaths, unexpandedFeaturePaths, supportCodePaths } =
        await resolvePaths(cwd, {
          sources: {
            paths: [relativeFeaturePath],
          },
          support: {
            paths: [],
            transpileWith: [],
          },
        })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
      expect(supportCodePaths).to.eql([jsSupportCodePath, esmSupportCodePath])
    })

    it('deduplicates the .feature files before returning', async function () {
      // Arrange
      const cwd = await buildTestWorkingDirectory()
      const relativeFeaturePath = path.join('features', 'a.feature')
      const featurePath = path.join(cwd, relativeFeaturePath)
      await fsExtra.outputFile(featurePath, '')
      // Act
      const { featurePaths } = await resolvePaths(cwd, {
        sources: {
          paths: [`${relativeFeaturePath}:3`, `${relativeFeaturePath}:4`],
        },
        support: {
          paths: [],
          transpileWith: [],
        },
      })

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
      const { featurePaths, unexpandedFeaturePaths, supportCodePaths } =
        await resolvePaths(cwd, {
          sources: { paths: [relativeFeaturePath] },
          support: {
            paths: [],
            transpileWith: [],
          },
        })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
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

      // Act
      const { featurePaths, unexpandedFeaturePaths, supportCodePaths } =
        await resolvePaths(cwd, {
          sources: { paths: [relativeFeaturePath] },
          support: {
            paths: [],
            transpileWith: [],
          },
        })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
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

      // Act
      const { featurePaths, unexpandedFeaturePaths, supportCodePaths } =
        await resolvePaths(cwd, {
          sources: { paths: [relativeFeaturePath] },
          support: {
            paths: [],
            transpileWith: [],
          },
        })

      // Assert
      expect(featurePaths).to.eql([featurePath])
      expect(unexpandedFeaturePaths).to.eql([relativeFeaturePath])
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
      // Act
      const { featurePaths, unexpandedFeaturePaths, supportCodePaths } =
        await resolvePaths(cwd, {
          sources: { paths: [relativeRerunPath] },
          support: {
            paths: [],
            transpileWith: [],
          },
        })

      // Assert
      expect(featurePaths).to.eql([])
      expect(unexpandedFeaturePaths).to.eql([])
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
      // Act
      const { featurePaths, unexpandedFeaturePaths, supportCodePaths } =
        await resolvePaths(cwd, {
          sources: { paths: [relativeRerunPath] },
          support: {
            paths: [],
            transpileWith: [],
          },
        })

      // Assert
      expect(featurePaths).to.eql([])
      expect(unexpandedFeaturePaths).to.eql([])
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

      // Act
      const { featurePaths, unexpandedFeaturePaths, supportCodePaths } =
        await resolvePaths(cwd, {
          sources: { paths: [relativeRerunPath] },
          support: {
            paths: [],
            transpileWith: [],
          },
        })

      // Assert
      expect(featurePaths).to.eql([])
      expect(unexpandedFeaturePaths).to.eql([])
      expect(supportCodePaths).to.eql([])
    })
  })
})
