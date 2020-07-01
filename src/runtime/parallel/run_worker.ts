import Worker from './worker'
import VError from 'verror'
import { doesHaveValue } from '../../value_checker'

function run(): void {
  const exit = (exitCode: number, error?: Error, message?: string): void => {
    if (doesHaveValue(error)) {
      console.error(VError.fullStack(new VError(error, message))) // eslint-disable-line no-console
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
