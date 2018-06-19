import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { getTestCasesFromFilesystem } from './helpers'
import { promisify } from 'bluebird'
import EventEmitter from 'events'
import fsExtra from 'fs-extra'
import path from 'path'
import PickleFilter from '../pickle_filter'
import tmp from 'tmp'

describe('helpers', () => {
  describe('getTestCasesFromFilesystem', () => {
    beforeEach(async function() {
      this.onSource = sinon.stub()
      this.onGherkinDocument = sinon.stub()
      this.onPickle = sinon.stub()
      this.onPickleAccepted = sinon.stub()
      this.onPickleRejected = sinon.stub()
      this.eventBroadcaster = new EventEmitter()
      this.eventBroadcaster.on('source', this.onSource)
      this.eventBroadcaster.on('gherkin-document', this.onGherkinDocument)
      this.eventBroadcaster.on('pickle', this.onPickle)
      this.eventBroadcaster.on('pickle-accepted', this.onPickleAccepted)
      this.eventBroadcaster.on('pickle-rejected', this.onPickleRejected)
    })

    describe('empty feature', () => {
      beforeEach(async function() {
        this.tmpDir = await promisify(tmp.dir)()
        this.relativeFeaturePath = path.join('features', 'a.feature')
        const featurePath = path.join(this.tmpDir, 'features', 'a.feature')
        await fsExtra.outputFile(featurePath, '')
        this.result = await getTestCasesFromFilesystem({
          cwd: this.tmpDir,
          eventBroadcaster: this.eventBroadcaster,
          featurePaths: [featurePath],
          order: 'defined',
          pickleFilter: new PickleFilter({}),
        })
      })

      it('returns an empty array', function() {
        expect(this.result).to.eql([])
      })

      it('emits a source event', function() {
        expect(this.onSource).to.have.callCount(1)
        expect(this.onSource).to.have.been.calledWith({
          data: '',
          media: { encoding: 'utf-8', type: 'text/x.cucumber.gherkin+plain' },
          uri: this.relativeFeaturePath,
        })
      })

      it('emits a gherkin-document event', function() {
        expect(this.onGherkinDocument).to.have.callCount(1)
        const arg = this.onGherkinDocument.firstCall.args[0]
        expect(arg).to.have.keys(['document', 'uri'])
        expect(arg.uri).to.eql(this.relativeFeaturePath)
      })

      it('does not emit pickle events', function() {
        expect(this.onPickle).to.have.callCount(0)
        expect(this.onPickleAccepted).to.have.callCount(0)
        expect(this.onPickleRejected).to.have.callCount(0)
      })
    })

    describe('feature with scenario that does not match the filter', () => {
      beforeEach(async function() {
        this.tmpDir = await promisify(tmp.dir)()
        this.relativeFeaturePath = path.join('features', 'a.feature')
        const featurePath = path.join(this.tmpDir, 'features', 'a.feature')
        await fsExtra.outputFile(
          featurePath,
          'Feature: a\nScenario: b\nGiven a step'
        )
        this.result = await getTestCasesFromFilesystem({
          cwd: this.tmpDir,
          eventBroadcaster: this.eventBroadcaster,
          featurePaths: [featurePath],
          order: 'defined',
          pickleFilter: new PickleFilter({
            featurePaths: [`${this.relativeFeaturePath}:5`],
          }),
        })
      })

      it('returns an empty array', function() {
        expect(this.result).to.eql([])
      })

      it('emits a source event', function() {
        expect(this.onSource).to.have.callCount(1)
        expect(this.onSource).to.have.been.calledWith({
          data: 'Feature: a\nScenario: b\nGiven a step',
          media: { encoding: 'utf-8', type: 'text/x.cucumber.gherkin+plain' },
          uri: this.relativeFeaturePath,
        })
      })

      it('emits a gherkin-document event', function() {
        expect(this.onGherkinDocument).to.have.callCount(1)
        const arg = this.onGherkinDocument.firstCall.args[0]
        expect(arg).to.have.keys(['document', 'uri'])
        expect(arg.uri).to.eql(this.relativeFeaturePath)
      })
    })

    describe('feature with scenario that matches the filter', () => {
      beforeEach(async function() {
        this.tmpDir = await promisify(tmp.dir)()
        this.relativeFeaturePath = path.join('features', 'a.feature')
        const featurePath = path.join(this.tmpDir, 'features', 'a.feature')
        await fsExtra.outputFile(
          featurePath,
          'Feature: a\nScenario: b\nGiven a step'
        )
        this.result = await getTestCasesFromFilesystem({
          cwd: this.tmpDir,
          eventBroadcaster: this.eventBroadcaster,
          featurePaths: [featurePath],
          order: 'defined',
          pickleFilter: new PickleFilter({}),
        })
      })

      it('returns the test case', function() {
        expect(this.result).to.have.lengthOf(1)
        expect(this.result[0]).to.have.keys(['pickle', 'uri'])
        expect(this.result[0].uri).to.eql(this.relativeFeaturePath)
      })

      it('emits a source event', function() {
        expect(this.onSource).to.have.callCount(1)
        expect(this.onSource).to.have.been.calledWith({
          data: 'Feature: a\nScenario: b\nGiven a step',
          media: { encoding: 'utf-8', type: 'text/x.cucumber.gherkin+plain' },
          uri: this.relativeFeaturePath,
        })
      })

      it('emits a gherkin-document event', function() {
        expect(this.onGherkinDocument).to.have.callCount(1)
        const arg = this.onGherkinDocument.firstCall.args[0]
        expect(arg).to.have.keys(['document', 'uri'])
        expect(arg.uri).to.eql(this.relativeFeaturePath)
      })

      it('emits a pickle and pickle-accepted event', function() {
        expect(this.onPickle).to.have.callCount(1)
        expect(this.onPickleAccepted).to.have.callCount(1)
        expect(this.onPickleRejected).to.have.callCount(0)
        const onPickleArg = this.onPickle.firstCall.args[0]
        expect(onPickleArg).to.have.keys(['pickle', 'uri'])
        expect(onPickleArg.uri).to.eql(this.relativeFeaturePath)
        const onPickleAcceptedArg = this.onPickleAccepted.firstCall.args[0]
        expect(onPickleAcceptedArg).to.eql(onPickleArg)
      })
    })
  })
})
