import PickleFilter from './pickle_filter'

describe('PickleFilter', function() {
  describe('matches', function() {
    beforeEach(function() {
      this.input = {
        pickle: {
          locations: [],
          name: '',
          tags: []
        },
        uri: ''
      }
    })

    describe('no filters', function() {
      beforeEach(function() {
        this.pickleFilter = new PickleFilter({
          featurePaths: ['features'],
          names: [],
          tagExpressions: []
        })
      })

      it('returns true', function() {
        expect(this.pickleFilter.matches(this.input)).to.be.true
      })
    })

    describe('line filters', function() {
      beforeEach(function() {
        this.pickleFilter = new PickleFilter({
          featurePaths: ['features/a.feature', 'features/b.feature:1:2'],
          names: [],
          tagExpressions: []
        })
      })

      describe('scenario in feature without line specified', function() {
        beforeEach(function() {
          this.input.uri = 'features/a.feature'
        })

        it('returns true', function() {
          expect(this.pickleFilter.matches(this.input)).to.be.true
        })
      })

      describe('scenario in feature with line specified', function() {
        beforeEach(function() {
          this.input.uri = 'features/b.feature'
        })

        describe('scenario line matches', function() {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 1 }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario line does not match', function() {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 3 }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })
      })

      describe('scenario line using current directory path representation', function() {
        beforeEach(function() {
          this.input.uri = './features/b.feature'
        })

        describe('scenario line matches', function() {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 1 }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario line does not match', function() {
          beforeEach(function() {
            this.input.pickle.locations = [{ line: 3 }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })
      })
    })

    describe('name filters', function() {
      describe('should match name A', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: ['nameA'],
            tagExpressions: []
          })
        })

        describe('scenario name matches A', function() {
          beforeEach(function() {
            this.input.pickle.name = 'nameA descriptionA'
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario name does not match A', function() {
          beforeEach(function() {
            this.input.pickle.name = 'nameB descriptionB'
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })
      })

      describe('should match name A or B', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: ['nameA', 'nameB'],
            tagExpressions: []
          })
        })

        describe('scenario name matches A', function() {
          beforeEach(function() {
            this.input.pickle.name = 'nameA descriptionA'
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario name matches B', function() {
          beforeEach(function() {
            this.input.pickle.name = 'nameB descriptionB'
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario name does not match A or B', function() {
          beforeEach(function() {
            this.input.pickle.name = 'nameC descriptionC'
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })
      })
    })

    describe('tag filters', function() {
      describe('should have tag A', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA'
          })
        })

        describe('scenario has tag A', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario does not have tag A', function() {
          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })
      })

      describe('should not have tag A', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: 'not @tagA'
          })
        })

        describe('scenario has tag A', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })

        describe('scenario does not have tag A', function() {
          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })
      })

      describe('should have tag A and B', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA and @tagB'
          })
        })

        describe('scenario has tag A and B', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }, { name: '@tagB' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario has tag A, but not B', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })

        describe('scenario has tag B, but not A', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagB' }]
          })

          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })

        describe('scenario does have tag A or B', function() {
          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })
      })

      describe('should have tag A or B', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA or @tagB'
          })
        })

        describe('scenario has tag A and B', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }, { name: '@tagB' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario has tag A, but not B', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagA' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario has tag B, but not A', function() {
          beforeEach(function() {
            this.input.pickle.tags = [{ name: '@tagB' }]
          })

          it('returns true', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.true
          })
        })

        describe('scenario does have tag A or B', function() {
          it('returns false', function() {
            expect(this.pickleFilter.matches(this.input)).to.be.false
          })
        })
      })
    })

    describe('line, name, and tag filters', function() {
      beforeEach(function() {
        this.input.uri = 'features/b.feature'
      })

      describe('scenario matches all filters', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features/b.feature:1:2'],
            names: ['nameA'],
            tagExpressions: ['@tagA']
          })
          this.input.pickle.locations = [{ line: 1 }]
          this.input.pickle.name = 'nameA descriptionA'
          this.input.pickle.tags = [{ name: '@tagA' }]
        })

        it('returns true', function() {
          expect(this.pickleFilter.matches(this.input)).to.be.true
        })
      })

      describe('scenario matches some filters', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features/b.feature:1:2'],
            names: ['nameA'],
            tagExpressions: ['tagA']
          })
          this.input.pickle.locations = [{ line: 1 }]
        })

        it('returns false', function() {
          expect(this.pickleFilter.matches(this.input)).to.be.false
        })
      })

      describe('scenario matches no filters', function() {
        beforeEach(function() {
          this.pickleFilter = new PickleFilter({
            featurePaths: ['features/b.feature:1:2'],
            names: ['nameA'],
            tagExpression: '@tagA'
          })
          this.input.pickle.locations = [{ line: 1 }]
        })

        it('returns false', function() {
          expect(this.pickleFilter.matches(this.input)).to.be.false
        })
      })
    })
  })
})
