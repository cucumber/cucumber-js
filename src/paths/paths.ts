import path from 'node:path'
import { glob } from 'glob'
import fs from 'mz/fs'
import { ILogger } from '../logger'
import { ISourcesCoordinates, ISupportCodeCoordinates } from '../api'
import { IResolvedPaths } from './types'

export async function resolvePaths(
  logger: ILogger,
  cwd: string,
  sources: Pick<ISourcesCoordinates, 'paths'>,
  support: ISupportCodeCoordinates = {
    requireModules: [],
    requirePaths: [],
    importPaths: [],
    loaders: [],
  }
): Promise<IResolvedPaths> {
  const unexpandedSourcePaths = await getUnexpandedSourcePaths(
    cwd,
    sources.paths
  )
  const sourcePaths: string[] = await expandSourcePaths(
    cwd,
    unexpandedSourcePaths
  )
  logger.debug('Found source files based on configuration:', sourcePaths)
  const { requirePaths, importPaths } = await deriveSupportPaths(
    cwd,
    sourcePaths,
    support.requirePaths,
    support.importPaths
  )
  logger.debug(
    'Found support files to load via `require` based on configuration:',
    requirePaths
  )
  logger.debug(
    'Found support files to load via `import` based on configuration:',
    importPaths
  )
  return {
    unexpandedSourcePaths: unexpandedSourcePaths,
    sourcePaths: sourcePaths,
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
      const matches = await glob(unexpandedPath, {
        absolute: true,
        windowsPathsNoEscape: true,
        cwd,
      })
      const expanded = await Promise.all(
        matches.map(async (match) => {
          if (path.extname(match) === '') {
            return glob(`${match}/**/*${defaultExtension}`, {
              windowsPathsNoEscape: true,
            })
          }
          return [match]
        })
      )
      return expanded.flat().sort()
    })
  )
  const normalized = expandedPaths.flat().map((x) => path.normalize(x))
  return [...new Set(normalized)]
}

async function getUnexpandedSourcePaths(
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

async function expandSourcePaths(
  cwd: string,
  featurePaths: string[]
): Promise<string[]> {
  featurePaths = featurePaths.map((p) => p.replace(/(:\d+)*$/g, '')) // Strip line numbers
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
    const importPaths = await expandPaths(cwd, defaultPaths, '.@(js|cjs|mjs)')
    return { requirePaths: [], importPaths }
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
