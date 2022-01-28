import stackChain from 'stack-chain'
import path from 'path'
import { valueOrDefault } from './value_checker'
import CallSite = NodeJS.CallSite

const projectRootPath = path.join(__dirname, '..')
const projectChildDirs = ['src', 'lib', 'node_modules']

export function isFileNameInCucumber(fileName: string): boolean {
  return projectChildDirs.some((dir) =>
    fileName.startsWith(path.join(projectRootPath, dir))
  )
}

export default class StackTraceFilter {
  private currentFilter: CallSite[]

  filter(): void {
    this.currentFilter = stackChain.filter.attach(
      (_err: any, frames: CallSite[]) => {
        if (this.isErrorInCucumber(frames)) {
          return frames
        }
        const index = frames.findIndex((x) => this.isFrameInCucumber(x))
        if (index === -1) {
          return frames
        }
        return frames.slice(0, index)
      }
    )
  }

  isErrorInCucumber(frames: CallSite[]): boolean {
    const filteredFrames = frames.filter((x) => !this.isFrameInNode(x))
    return (
      filteredFrames.length > 0 && this.isFrameInCucumber(filteredFrames[0])
    )
  }

  isFrameInCucumber(frame: CallSite): boolean {
    const fileName = valueOrDefault(frame.getFileName(), '')
    return isFileNameInCucumber(fileName)
  }

  isFrameInNode(frame: CallSite): boolean {
    const fileName = valueOrDefault(frame.getFileName(), '')
    return !fileName.includes(path.sep)
  }

  unfilter(): void {
    stackChain.filter.deattach(this.currentFilter)
  }
}
