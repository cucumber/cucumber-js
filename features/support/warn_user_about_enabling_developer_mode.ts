import { reindent } from 'reindent-template-literals'
import colors from 'colors/safe'

export function warnUserAboutEnablingDeveloperMode(error: any): void {
  if (!(error?.code === 'EPERM')) {
    throw error
  }
  if (!(process.platform === 'win32')) {
    throw error
  }

  console.error(
    colors.red(
      reindent(`
        Error: Unable to run feature tests!
        
        You need to enable Developer Mode in Windows to run Cucumber JS's feature tests.

        See this link for more info: 
        https://docs.microsoft.com/en-us/windows/apps/get-started/developer-mode-features-and-debugging
      `)
    )
  )
  process.exit(1)
}
