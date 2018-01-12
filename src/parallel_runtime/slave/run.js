import Slave from './slave'

export default async function run() {
  const slave = new Slave({
    stdin: process.stdin,
    stdout: process.stdout
  })
  await slave.run()
}
