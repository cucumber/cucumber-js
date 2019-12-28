import Slave from './slave'
import VError from 'verror'
import { doesHaveValue } from '../../value_checker'

export default function run(): void {
  const exit = (exitCode: number, error?: Error, message?: string): void => {
    if (doesHaveValue(error)) {
      console.error(VError.fullStack(new VError(error, message))) // eslint-disable-line no-console
    }
    process.exit(exitCode)
  }
  const slave = new Slave({
    id: process.env.CUCUMBER_SLAVE_ID,
    sendMessage: (message: any) => process.send(message),
    cwd: process.cwd(),
    exit,
  })
  process.on('message', (m: any): void => {
    slave
      .receiveMessage(m)
      .catch((error: Error) =>
        exit(1, error, 'Unexpected error on slave.receiveMessage')
      )
  })
}
