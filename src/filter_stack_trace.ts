import path from 'node:path'
import { StackFrame } from 'error-stack-parser'
import { valueOrDefault } from './value_checker'

const projectRootPath = path.join(__dirname, '..')
const projectChildDirs = ['src', 'lib', 'node_modules']

export function isFileNameInCucumber(fileName: string): boolean {
  return projectChildDirs.some((dir) =>
    fileName.startsWith(path.join(projectRootPath, dir))
  )
}

export function filterStackTrace(frames: StackFrame[]): StackFrame[] {
  if (isErrorInCucumber(frames)) {
    return frames
  }
  const index = frames.findIndex((x) => isFrameInCucumber(x))
  if (index === -1) {
    return frames
  }
  return frames.slice(0, index)
}

function isErrorInCucumber(frames: StackFrame[]): boolean {
  const filteredFrames = frames.filter((x) => !isFrameInNode(x))
  return filteredFrames.length > 0 && isFrameInCucumber(filteredFrames[0])
}

function isFrameInCucumber(frame: StackFrame): boolean {
  const fileName = valueOrDefault(frame.getFileName(), '')
  return isFileNameInCucumber(fileName)
}

function isFrameInNode(frame: StackFrame): boolean {
  const fileName = valueOrDefault(frame.getFileName(), '')
  return !fileName.includes(path.sep)
}
