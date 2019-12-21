import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { parseGherkinMessageStream } from './helpers'
import EventEmitter from 'events'
import PickleFilter from '../pickle_filter'
import { messages } from 'cucumber-messages'
import { EventDataCollector } from '../formatter/helpers'
import Gherkin from 'gherkin'

describe('helpers', () => {
  describe('parseGherkinMessageStream', () => {
    beforeEach(function() {
      this.onEnvelope = sinon.stub()
      this.eventBroadcaster = new EventEmitter()
      this.eventDataCollector = new EventDataCollector(this.eventBroadcaster)
      this.eventBroadcaster.on('envelope', this.onEnvelope)
    })

    describe('empty feature', () => {
      const sourceEnvelope = messages.Envelope.create({
        source: {
          data: '',
          media: {
            contentType: 'text/x.cucumber.gherkin+plain',
            encoding: messages.Media.Encoding.UTF8,
          },
          uri: '/project/features/a.feature',
        },
      })

      beforeEach(async function() {
        const gherkinMessageStream = Gherkin.fromSources([sourceEnvelope])
        this.result = await parseGherkinMessageStream({
          cwd: '/project',
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          gherkinMessageStream,
          order: 'defined',
          pickleFilter: new PickleFilter({ cwd: '/project' }),
        })
      })

      it('returns an empty array', function() {
        expect(this.result).to.eql([])
      })

      it('emits 2 events', function() {
        expect(this.onEnvelope).to.have.callCount(2)
      })

      it('emits a source event', function() {
        expect(this.onEnvelope).to.have.been.calledWith(sourceEnvelope)
      })

      it('emits a gherkin-document event', function() {
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.gherkinDocument).to.exist()
        expect(envelope.gherkinDocument).to.have.keys(['comments', 'uri'])
      })
    })

    describe('feature with scenario that does not match the filter', () => {
      const sourceEnvelope = messages.Envelope.create({
        source: {
          data: 'Feature: a\nScenario: b\nGiven a step',
          media: {
            contentType: 'text/x.cucumber.gherkin+plain',
            encoding: messages.Media.Encoding.UTF8,
          },
          uri: '/project/features/a.feature',
        },
      })

      beforeEach(async function() {
        const gherkinMessageStream = Gherkin.fromSources([sourceEnvelope])
        this.result = await parseGherkinMessageStream({
          cwd: '/project',
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          gherkinMessageStream,
          order: 'defined',
          pickleFilter: new PickleFilter({
            cwd: this.tmpDir,
            featurePaths: [`/project/features/a.feature:5`],
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
        expect(this.onEnvelope).to.have.been.calledWith(sourceEnvelope)
      })

      it('emits a gherkin-document event', function() {
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.gherkinDocument).to.exist()
        expect(envelope.gherkinDocument).to.have.keys([
          'comments',
          'feature',
          'uri',
        ])
      })

      it('emits a pickle event', function() {
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.pickle).to.exist()
        expect(envelope.pickle).to.have.keys([
          'astNodeIds',
          'id',
          'language',
          'name',
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
      const sourceEnvelope = messages.Envelope.create({
        source: {
          data: 'Feature: a\nScenario: b\nGiven a step',
          media: {
            contentType: 'text/x.cucumber.gherkin+plain',
            encoding: messages.Media.Encoding.UTF8,
          },
          uri: '/project/features/a.feature',
        },
      })

      beforeEach(async function() {
        const gherkinMessageStream = Gherkin.fromSources([sourceEnvelope])
        this.result = await parseGherkinMessageStream({
          cwd: this.tmpDir,
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          gherkinMessageStream,
          order: 'defined',
          pickleFilter: new PickleFilter({ cwd: this.tmpDir }),
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
        expect(this.onEnvelope).to.have.been.calledWith(sourceEnvelope)
      })

      it('emits a gherkin-document event', function() {
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.gherkinDocument).to.exist()
        expect(envelope.gherkinDocument).to.have.keys([
          'comments',
          'feature',
          'uri',
        ])
      })

      it('emits a pickle event', function() {
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.pickle).to.exist()
        expect(envelope.pickle).to.have.keys([
          'astNodeIds',
          'id',
          'language',
          'name',
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
