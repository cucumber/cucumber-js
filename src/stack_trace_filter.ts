import _ from 'lodash'
import stackChain from 'stack-chain'
import path from 'path'

const projectRootPath = path.join(__dirname, '..')
const projectChildDirs = ['src', 'lib', 'node_modules']

export function isFileNameInCucumber(fileName) {
  return _.some(projectChildDirs, dir =>
    _.startsWith(fileName, path.join(projectRootPath, dir))
  )
}

export default class StackTraceFilter {
  private currentFilter: any

  filter() {
    this.currentFilter = stackChain.filter.attach((_err, frames) => {
      if (this.isErrorInCucumber(frames)) {
        return frames
      }
      const index = _.findIndex(frames, this.isFrameInCucumber.bind(this))
      if (index === -1) {
        return frames
      }
      return frames.slice(0, index)
    })
  }

  isErrorInCucumber(frames) {
    const filteredFrames = _.reject(frames, this.isFrameInNode.bind(this))
    return (
      filteredFrames.length > 0 && this.isFrameInCucumber(filteredFrames[0])
    )
  }

  isFrameInCucumber(frame) {
    const fileName = frame.getFileName() || ''
    return isFileNameInCucumber(fileName)
  }

  isFrameInNode(frame) {
    const fileName = frame.getFileName() || ''
    return !_.includes(fileName, path.sep)
  }

  unfilter() {
    stackChain.filter.deattach(this.currentFilter)
  }
}
