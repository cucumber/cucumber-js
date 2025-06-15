import path from 'node:path'
import { Writable } from 'node:stream'
import { mkdirp } from 'mkdirp'
import fs from 'mz/fs'
import { ILogger } from '../environment'

export async function createStream(
  target: string,
  onStreamError: () => void,
  cwd: string,
  logger: ILogger
) {
  const absoluteTarget = path.resolve(cwd, target)
  const directory = path.dirname(absoluteTarget)

  try {
    await mkdirp(directory)
  } catch (e) {
    logger.warn('Failed to ensure directory for formatter target exists', e)
  }

  const stream: Writable = fs.createWriteStream(null, {
    fd: await fs.open(absoluteTarget, 'w'),
  })

  stream.on('error', (error: Error) => {
    logger.error(error.message)
    onStreamError()
  })

  return {
    directory,
    stream,
  }
}
