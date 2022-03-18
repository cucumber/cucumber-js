import { promisify } from 'util'
import glob from 'glob'
import path from 'path'
import fs from 'mz/fs'
import { ISourcesCoordinates, ISupportCodeCoordinates } from './types'

export async function resolvePaths(
  cwd: string,
  sources: Pick<ISourcesCoordinates, 'paths'>,
  support: ISupportCodeCoordinates = {
    requireModules: [],
    requirePaths: [],
    importPaths: [],
  }
): Promise<{
  unexpandedFeaturePaths: string[]
  featurePaths: string[]
  requirePaths: string[]
  importPaths: string[]
}> {
  const unexpandedFeaturePaths = await getUnexpandedFeaturePaths(
    cwd,
    sources.paths
  )
  const featurePaths: string[] = await expandFeaturePaths(
    cwd,
    unexpandedFeaturePaths
  )
  const { requirePaths, importPaths } = await deriveSupportPaths(
    cwd,
    featurePaths,
    support.requirePaths,
    support.importPaths
  )
  return {
    unexpandedFeaturePaths,
    featurePaths,
    requirePaths,
    importPaths,
  }
}

async function expandPaths(
  cwd: string,
  unexpandedPaths: string[],
  defaultExtension: string
): Promise<string[]> {
  const expandedPaths = await Promise.all(
    unexpandedPaths.map(async (unexpandedPath) => {
      const matches = await promisify(glob)(unexpandedPath, {
        absolute: true,
        cwd,
      })
      const expanded = await Promise.all(
        matches.map(async (match) => {
          if (path.extname(match) === '') {
            return await promisify(glob)(`${match}/**/*${defaultExtension}`)
          }
          return [match]
        })
      )
      return expanded.flat()
    })
  )
  return expandedPaths.flat().map((x) => path.normalize(x))
}

async function getUnexpandedFeaturePaths(
  cwd: string,
  args: string[]
): Promise<string[]> {
  if (args.length > 0) {
    const nestedFeaturePaths = await Promise.all(
      args.map(async (arg) => {
        const filename = path.basename(arg)
        if (filename[0] === '@') {
          const filePath = path.join(cwd, arg)
          const content = await fs.readFile(filePath, 'utf8')
          return content.split('\n').map((x) => x.trim())
        }
        return [arg]
      })
    )
    const featurePaths = nestedFeaturePaths.flat()
    if (featurePaths.length > 0) {
      return featurePaths.filter((x) => x !== '')
    }
  }
  return ['features/**/*.{feature,feature.md}']
}

function getFeatureDirectoryPaths(
  cwd: string,
  featurePaths: string[]
): string[] {
  const featureDirs = featurePaths.map((featurePath) => {
    let featureDir = path.dirname(featurePath)
    let childDir: string
    let parentDir = featureDir
    while (childDir !== parentDir) {
      childDir = parentDir
      parentDir = path.dirname(childDir)
      if (path.basename(parentDir) === 'features') {
        featureDir = parentDir
        break
      }
    }
    return path.relative(cwd, featureDir)
  })
  return [...new Set(featureDirs)]
}

async function expandFeaturePaths(
  cwd: string,
  featurePaths: string[]
): Promise<string[]> {
  featurePaths = featurePaths.map((p) => p.replace(/(:\d+)*$/g, '')) // Strip line numbers
  featurePaths = [...new Set(featurePaths)] // Deduplicate the feature files
  return await expandPaths(cwd, featurePaths, '.feature')
}

async function deriveSupportPaths(
  cwd: string,
  featurePaths: string[],
  unexpandedRequirePaths: string[],
  unexpandedImportPaths: string[]
): Promise<{
  requirePaths: string[]
  importPaths: string[]
}> {
  if (
    unexpandedRequirePaths.length === 0 &&
    unexpandedImportPaths.length === 0
  ) {
    const defaultPaths = getFeatureDirectoryPaths(cwd, featurePaths)
    const requirePaths = await expandPaths(cwd, defaultPaths, '.js')
    const importPaths = await expandPaths(cwd, defaultPaths, '.mjs')
    return { requirePaths, importPaths }
  }
  const requirePaths =
    unexpandedRequirePaths.length > 0
      ? await expandPaths(cwd, unexpandedRequirePaths, '.js')
      : []
  const importPaths =
    unexpandedImportPaths.length > 0
      ? await expandPaths(cwd, unexpandedImportPaths, '.@(js|cjs|mjs)')
      : []
  return { requirePaths, importPaths }
}
