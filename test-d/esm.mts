import { type IWorldOptions, World } from '@cucumber/cucumber'
import type { IRunEnvironment } from '@cucumber/cucumber/api'
import { expectAssignable } from 'tsd'

// types re-exported from the root and api entry points should be importable
// under ESM (node16/nodenext) resolution
declare const worldOptions: IWorldOptions
expectAssignable<World>(new World(worldOptions))

expectAssignable<IRunEnvironment>({ env: process.env })
