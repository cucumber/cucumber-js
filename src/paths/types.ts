/**
 * Paths that woll be used to load feature files and user code
 * @public
 * @remarks
 * These values are the result of pre-processing to expand globs, expand
 * directory references, and apply defaults where applicable.
 */
export interface IResolvedPaths {
  unexpandedSourcePaths: string[]
  sourcePaths: string[]
  requirePaths: string[]
  importPaths: string[]
}
