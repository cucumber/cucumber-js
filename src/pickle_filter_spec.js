import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import PickleFilter from './pickle_filter'

describe('PickleFilter', () => {
  describe('matches', () => {
    beforeEach(function() {
      this.input = {
        pickle: {
          locations: [],
          name: '',
          tags: [],
        },
        uri: '',
      }
    })

    describe('no filters', () => {
      beforeEach(function() {
        this.pickleFilter = new PickleFilter({
          featurePaths: ['features'],
          names: [],
          tagExpression: '',
        })
      })

      it('returns true', function() {
        expect(this.pickleFilter.matches(this.input)).to.eql(true)
      })
    })

    describe('line filters', () => {
      beforeEach(function() {
        this.pickleFilter = new PickleFilter({
          featurePaths: ['features/a.feature', 'features/b.feature:1:2'],
          names: [],
          tagExpression: '',
        })
      })

      describe('scenario in feature without line specified', () => {
        beforeEach(function() {
          this.input.uri = 'features/a.feature'
        })

        it('returns true', function() {
          expect(this.pickleFilter.matches(this.input)).to.eql(true)
        })
      })

      describe('scenario in feature with line specified', () => {
        beforeEach(function() {
          this.input.uri = 'features/b.feature'
        })

        describe('scenario line matches', () => {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 1 }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario line does not match', () => {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 3 }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })
      })

      describe('scenario line using current directory path representation', () => {
        beforeEach(function() {
          this.input.uri = './features/b.feature'
        })

        describe('scenario line matches', () => {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 1 }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario line does not match', () => {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 3 }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })
      })
    })

    describe('name filters', () => {
      describe('should match name A', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: ['nameA'],
            tagExpression: '',
          })
        })

        describe('scenario name matches A', () => {
          beforeEach(function() {
            this.input.pickle.name = 'nameA descriptionA'
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario name does not match A', () => {
          beforeEach(function() {
            this.input.pickle.name = 'nameB descriptionB'
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })
      })

      describe('should match name A or B', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: ['nameA', 'nameB'],
            tagExpression: '',
          })
        })

        describe('scenario name matches A', () => {
          beforeEach(function() {
            this.input.pickle.name = 'nameA descriptionA'
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario name matches B', () => {
          beforeEach(function() {
            this.input.pickle.name = 'nameB descriptionB'
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario name does not match A or B', () => {
          beforeEach(function() {
            this.input.pickle.name = 'nameC descriptionC'
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })
      })
    })

    describe('tag filters', () => {
      describe('should have tag A', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA',
          })
        })

        describe('scenario has tag A', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario does not have tag A', () => {
          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })
      })

      describe('should not have tag A', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: 'not @tagA',
          })
        })

        describe('scenario has tag A', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })

        describe('scenario does not have tag A', () => {
          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })
      })

      describe('should have tag A and B', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA and @tagB',
          })
        })

        describe('scenario has tag A and B', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }, { name: '@tagB' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario has tag A, but not B', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })

        describe('scenario has tag B, but not A', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagB' }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })

        describe('scenario does have tag A or B', () => {
          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })
      })

      describe('should have tag A or B', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA or @tagB',
          })
        })

        describe('scenario has tag A and B', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }, { name: '@tagB' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario has tag A, but not B', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario has tag B, but not A', () => {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagB' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(true)
          })
        })

        describe('scenario does have tag A or B', () => {
          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.eql(false)
          })
        })
      })
    })

    describe('line, name, and tag filters', () => {
      beforeEach(function() {
        this.input.uri = 'features/b.feature'
      })

      describe('scenario matches all filters', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features/b.feature:1:2'],
            names: ['nameA'],
            tagExpression: '@tagA',
          })
          this.input.pickle.locations = [{ line: 1 }]
          this.input.pickle.name = 'nameA descriptionA'
          this.input.pickle.tags = [{ name: '@tagA' }]
        })

        it('returns true', function() {
          expect(this.pickleFilter.matches(this.input)).to.eql(true)
        })
      })

      describe('scenario matches some filters', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features/b.feature:1:2'],
            names: ['nameA'],
            tagExpression: 'tagA',
          })
          this.input.pickle.locations = [{ line: 1 }]
        })

        it('returns false', function() {
          expect(this.pickleFilter.matches(this.input)).to.eql(false)
        })
      })

      describe('scenario matches no filters', () => {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features/b.feature:1:2'],
            names: ['nameA'],
            tagExpression: '@tagA',
          })
          this.input.pickle.locations = [{ line: 1 }]
        })

        it('returns false', function() {
          expect(this.pickleFilter.matches(this.input)).to.eql(false)
        })
      })
    })
  })
})
