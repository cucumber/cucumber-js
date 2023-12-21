import { doesHaveValue } from '../../value_checker'
import Worker from './worker'

function run(): void {
  const exit = (exitCode: number, error?: Error, message?: string): void => {
    if (doesHaveValue(error)) {
      console.error(new Error(message, { cause: error })) // eslint-disable-line no-console
    }
    process.exit(exitCode)
  }
  const worker = new Worker({
    id: process.env.CUCUMBER_WORKER_ID,
    sendMessage: (message: any) => process.send(message),
    cwd: process.cwd(),
    exit,
  })
  process.on('message', (m: any): void => {
    worker
      .receiveMessage(m)
      .catch((error: Error) =>
        exit(1, error, 'Unexpected error on worker.receiveMessage')
      )
  })
}

run()
