import path from 'node:path'
import { Writable } from 'node:stream'
import { mkdirp } from 'mkdirp'
import fs from 'mz/fs'
import { ILogger } from '../logger'

export async function createStream(
  target: string,
  onStreamError: () => void,
  cwd: string,
  logger: ILogger
): Promise<Writable> {
  const absoluteTarget = path.resolve(cwd, target)

  try {
    await mkdirp(path.dirname(absoluteTarget))
  } catch (error) {
    logger.warn('Failed to ensure directory for formatter target exists')
  }

  const stream: Writable = fs.createWriteStream(null, {
    fd: await fs.open(absoluteTarget, 'w'),
  })

  stream.on('error', (error: Error) => {
    logger.error(error.message)
    onStreamError()
  })

  return stream
}
