import sinon from 'sinon'
import { ILogger } from '../src/logger'

export class FakeLogger implements ILogger {
  debug = sinon.fake()
  error = sinon.fake()
  warn = sinon.fake()
}
