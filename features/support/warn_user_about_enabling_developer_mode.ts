import { styleText } from 'node:util'
import { reindent } from 'reindent-template-literals'

export function warnUserAboutEnablingDeveloperMode(error: unknown): void {
  if (!((error as NodeJS.ErrnoException)?.code === 'EPERM')) {
    throw error
  }
  if (!(process.platform === 'win32')) {
    throw error
  }

  // biome-ignore lint/suspicious/noConsole: this is the user-facing warning
  console.error(
    styleText(
      'red',
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
