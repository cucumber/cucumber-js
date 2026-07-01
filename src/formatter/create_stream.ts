import fs from 'node:fs'
import path from 'node:path'
import type { Writable } from 'node:stream'
import type { ILogger } from '../environment'

export async function createStream(
  target: string,
  onStreamError: () => void,
  cwd: string,
  logger: ILogger
) {
  const absoluteTarget = path.resolve(cwd, target)
  const directory = path.dirname(absoluteTarget)

  try {
    await fs.promises.mkdir(directory, { recursive: true })
  } catch (e) {
    logger.warn('Failed to ensure directory for formatter target exists', e)
  }

  const stream: Writable = fs.createWriteStream(absoluteTarget)

  stream.on('error', (error: Error) => {
    logger.error(error.message)
    onStreamError()
  })

  return {
    directory,
    stream,
  }
}
