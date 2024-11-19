import { expectAssignable } from 'tsd'
import { IConfiguration, ILogger, loadConfiguration, runCucumber } from '../api'

// should allow api usage from /api subpath
const provided: Partial<IConfiguration> = {
  paths: ['features/foo.feature'],
}
const { runConfiguration } = await loadConfiguration({ provided })
const { success } = await runCucumber(runConfiguration)

// ILogger must be implemented by Console
expectAssignable<ILogger>(console)
