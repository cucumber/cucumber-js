import DataTable from './data_table'

describe('DataTable', function() {
  describe('table with headers', function() {
    beforeEach(function() {
      this.dataTable = new DataTable({
        rows: [
          {
            cells: [{ value: 'header 1' }, { value: 'header 2' }]
          },
          {
            cells: [{ value: 'row 1 col 1' }, { value: 'row 1 col 2' }]
          },
          {
            cells: [{ value: 'row 2 col 1' }, { value: 'row 2 col 2' }]
          }
        ]
      })
    })

    describe('rows', function() {
      it('returns a 2-D array without the header', function() {
        expect(this.dataTable.rows()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2']
        ])
      })
    })

    describe('hashes', function() {
      it('returns an array of object where the keys are the headers', function() {
        expect(this.dataTable.hashes()).to.eql([
          { 'header 1': 'row 1 col 1', 'header 2': 'row 1 col 2' },
          { 'header 1': 'row 2 col 1', 'header 2': 'row 2 col 2' }
        ])
      })
    })
  })

  describe('table without headers', function() {
    beforeEach(function() {
      this.dataTable = new DataTable({
        rows: [
          {
            cells: [{ value: 'row 1 col 1' }, { value: 'row 1 col 2' }]
          },
          {
            cells: [{ value: 'row 2 col 1' }, { value: 'row 2 col 2' }]
          }
        ]
      })
    })

    describe('raw', function() {
      it('returns a 2-D array', function() {
        expect(this.dataTable.raw()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2']
        ])
      })
    })

    describe('rowsHash', function() {
      it('returns an object where the keys are the first column', function() {
        expect(this.dataTable.rowsHash()).to.eql({
          'row 1 col 1': 'row 1 col 2',
          'row 2 col 1': 'row 2 col 2'
        })
      })
    })
  })
})
