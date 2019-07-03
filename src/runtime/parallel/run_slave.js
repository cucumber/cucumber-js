import Slave from './slave'

export default async function run() {
  const slave = new Slave({
    sendMessage: m => process.send(m),
    cwd: process.cwd(),
    exit: status => process.exit(status),
  })
  process.on('message', m => slave.receiveMessage(m))
}
