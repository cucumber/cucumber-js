import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { loadPicklesFromFilesystem } from './helpers'
import { promisify } from 'bluebird'
import EventEmitter from 'events'
import fsExtra from 'fs-extra'
import path from 'path'
import PickleFilter from '../pickle_filter'
import tmp from 'tmp'
import { messages } from 'cucumber-messages'
import { EventDataCollector } from '../formatter/helpers'

describe('helpers', () => {
  describe('loadPicklesFromFilesystem', () => {
    beforeEach(async function() {
      this.onEnvelope = sinon.stub()
      this.eventBroadcaster = new EventEmitter()
      this.eventDataCollector = new EventDataCollector(this.eventBroadcaster)
      this.eventBroadcaster.on('envelope', this.onEnvelope)
    })

    describe('empty feature', () => {
      beforeEach(async function() {
        this.tmpDir = await promisify(tmp.dir)()
        this.relativeFeaturePath = path.join('features', 'a.feature')
        this.absoluteFeaturePath = path.join(
          this.tmpDir,
          this.relativeFeaturePath
        )
        await fsExtra.outputFile(this.absoluteFeaturePath, '')
        this.result = await loadPicklesFromFilesystem({
          cwd: this.tmpDir,
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          featureDefaultLanguage: 'en',
          featurePaths: [this.absoluteFeaturePath],
          order: 'defined',
          pickleFilter: new PickleFilter({ cwd: this.tmpDir }),
        })
      })

      it('returns an empty array', function() {
        expect(this.result).to.eql([])
      })

      it('emits 2 events', function() {
        expect(this.onEnvelope).to.have.callCount(2)
      })

      it('emits a source event', function() {
        expect(this.onEnvelope).to.have.been.calledWith(
          new messages.Envelope({
            source: {
              data: '',
              media: {
                contentType: 'text/x.cucumber.gherkin+plain',
                encoding: messages.Media.Encoding.UTF8,
              },
              uri: this.absoluteFeaturePath,
            },
          })
        )
      })

      it('emits a gherkin-document event', function() {
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.gherkinDocument).to.exist()
        expect(envelope.gherkinDocument).to.have.keys(['comments', 'uri'])
        expect(envelope.gherkinDocument.uri).to.eql(this.absoluteFeaturePath)
      })
    })

    describe('feature with scenario that does not match the filter', () => {
      beforeEach(async function() {
        this.tmpDir = await promisify(tmp.dir)()
        this.relativeFeaturePath = path.join('features', 'a.feature')
        this.absoluteFeaturePath = path.join(
          this.tmpDir,
          this.relativeFeaturePath
        )
        await fsExtra.outputFile(
          this.absoluteFeaturePath,
          'Feature: a\nScenario: b\nGiven a step'
        )
        this.result = await loadPicklesFromFilesystem({
          cwd: this.tmpDir,
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          featureDefaultLanguage: 'en',
          featurePaths: [this.absoluteFeaturePath],
          order: 'defined',
          pickleFilter: new PickleFilter({
            cwd: this.tmpDir,
            featurePaths: [`${this.relativeFeaturePath}:5`],
          }),
        })
      })

      it('returns an empty array', function() {
        expect(this.result).to.eql([])
      })

      it('emits 4 events', function() {
        expect(this.onEnvelope).to.have.callCount(4)
      })

      it('emits a source event', function() {
        expect(this.onEnvelope).to.have.been.calledWith(
          new messages.Envelope({
            source: {
              data: 'Feature: a\nScenario: b\nGiven a step',
              media: {
                contentType: 'text/x.cucumber.gherkin+plain',
                encoding: messages.Media.Encoding.UTF8,
              },
              uri: this.absoluteFeaturePath,
            },
          })
        )
      })

      it('emits a gherkin-document event', function() {
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.gherkinDocument).to.exist()
        expect(envelope.gherkinDocument).to.have.keys([
          'comments',
          'feature',
          'uri',
        ])
        expect(envelope.gherkinDocument.uri).to.eql(this.absoluteFeaturePath)
      })

      it('emits a pickle event', function() {
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.pickle).to.exist()
        expect(envelope.pickle).to.have.keys([
          'id',
          'language',
          'name',
          'sourceIds',
          'steps',
          'tags',
          'uri',
        ])
      })

      it('emits a pickleRejected event', function() {
        const thirdEnvelope = this.onEnvelope.getCall(2).args[0]
        const fourthEnvelope = this.onEnvelope.getCall(3).args[0]
        expect(fourthEnvelope.pickleRejected).to.exist()
        expect(fourthEnvelope.pickleRejected.pickleId).to.eql(
          thirdEnvelope.pickle.id
        )
      })
    })

    describe('feature with scenario that matches the filter', () => {
      beforeEach(async function() {
        this.tmpDir = await promisify(tmp.dir)()
        this.relativeFeaturePath = path.join('features', 'a.feature')
        this.absoluteFeaturePath = path.join(
          this.tmpDir,
          this.relativeFeaturePath
        )
        await fsExtra.outputFile(
          this.absoluteFeaturePath,
          'Feature: a\nScenario: b\nGiven a step'
        )
        this.result = await loadPicklesFromFilesystem({
          cwd: this.tmpDir,
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          featureDefaultLanguage: 'en',
          featurePaths: [this.absoluteFeaturePath],
          order: 'defined',
          pickleFilter: new PickleFilter({}),
        })
      })

      it('returns the test case', function() {
        const thirdEnvelope = this.onEnvelope.getCall(2).args[0]
        expect(this.result).to.have.lengthOf(1)
        expect(this.result[0]).equal(thirdEnvelope.pickle.id)
      })

      it('emits 4 events', function() {
        expect(this.onEnvelope).to.have.callCount(4)
      })

      it('emits a source event', function() {
        expect(this.onEnvelope).to.have.been.calledWith(
          new messages.Envelope({
            source: {
              data: 'Feature: a\nScenario: b\nGiven a step',
              media: {
                contentType: 'text/x.cucumber.gherkin+plain',
                encoding: messages.Media.Encoding.UTF8,
              },
              uri: this.absoluteFeaturePath,
            },
          })
        )
      })

      it('emits a gherkin-document event', function() {
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.gherkinDocument).to.exist()
        expect(envelope.gherkinDocument).to.have.keys([
          'comments',
          'feature',
          'uri',
        ])
        expect(envelope.gherkinDocument.uri).to.eql(this.absoluteFeaturePath)
      })

      it('emits a pickle event', function() {
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.pickle).to.exist()
        expect(envelope.pickle).to.have.keys([
          'id',
          'language',
          'name',
          'sourceIds',
          'steps',
          'tags',
          'uri',
        ])
      })

      it('emits a pickleAccepted event', function() {
        const thirdEnvelope = this.onEnvelope.getCall(2).args[0]
        const fourthEnvelope = this.onEnvelope.getCall(3).args[0]
        expect(fourthEnvelope.pickleAccepted).to.exist()
        expect(fourthEnvelope.pickleAccepted.pickleId).to.eql(
          thirdEnvelope.pickle.id
        )
      })
    })
  })
})
