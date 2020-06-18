import _ from 'lodash'
import stackChain from 'stack-chain'
import path from 'path'
import { valueOrDefault } from './value_checker'
import CallSite = NodeJS.CallSite

const projectRootPath = path.join(__dirname, '..')
const projectChildDirs = ['src', 'lib', 'node_modules']

export function isFileNameInCucumber(fileName: string): boolean {
  return _.some(projectChildDirs, (dir) =>
    _.startsWith(fileName, path.join(projectRootPath, dir))
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
        const index = _.findIndex(frames, this.isFrameInCucumber.bind(this))
        if (index === -1) {
          return frames
        }
        return frames.slice(0, index)
      }
    )
  }

  isErrorInCucumber(frames: CallSite[]): boolean {
    const filteredFrames = _.reject(frames, this.isFrameInNode.bind(this))
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
    return !_.includes(fileName, path.sep)
  }

  unfilter(): void {
    stackChain.filter.deattach(this.currentFilter)
  }
}
