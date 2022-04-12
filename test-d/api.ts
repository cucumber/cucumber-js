import { loadConfiguration, runCucumber } from '../api'

// should allow api usage from /api subpath
const { runConfiguration } = await loadConfiguration()
const { success } = await runCucumber(runConfiguration)
