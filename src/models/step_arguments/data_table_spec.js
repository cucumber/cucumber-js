import DataTable from './data_table'

describe('DataTable', function () {
  describe('table with headers', function () {
    beforeEach(function () {
      this.dataTable = new DataTable({
        rows: [
          {
            cells: [
              {value: 'header 1'},
              {value: 'header 2'}
            ]
          }, {
            cells: [
              {value: 'row 1 col 1'},
              {value: 'row 1 col 2'}
            ]
          }, {
            cells: [
              {value: 'row 2 col 1'},
              {value: 'row 2 col 2'}
            ]
          }
        ]
      })
    })

    describe('rows', function () {
      it('returns a 2-D array without the header', function () {
        expect(this.dataTable.rows()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2']
        ])
      })
    })

    describe('hashes', function () {
      it('returns an array of object where the keys are the headers', function () {
        expect(this.dataTable.hashes()).to.eql([
          {'header 1': 'row 1 col 1', 'header 2': 'row 1 col 2'},
          {'header 1': 'row 2 col 1', 'header 2': 'row 2 col 2'}
        ])
      })
    })
  })

  describe('typed hashes', function() {
    it('rejects tables where not all rows have 3 columns', function() {
      const dataTable = new DataTable({
        rows: [
          {
            cells: [
              {value: 'key1'},
              {value: 'string'},
              {value:  'value'}
            ]
          } , {
            cells: [
              {value: 'key2'},
              {value: 'string'},
              {value: 'value'}
            ]
          } , {
            cells: [
              {value: 'key3'},
              {value: 'value'}
            ]
          }
        ]
      })
      expect(() => {
        dataTable.typedRowsHash()
      }).to.throw(Error)
    })

    it('rejects tables where not all types are recognized', function() {
      const dataTable = new DataTable({
        rows: [
          {
            cells: [
              {value: 'key1'},
              {value: 'string'},
              {value:  'value'}
            ]
          } , {
            cells: [
              {value: 'key2'},
              {value: 'OUPS'},
              {value: 'value'}
            ]
          } , {
            cells: [
              {value: 'key3'},
              {value: 'string'},
              {value: 'value'}
            ]
          }
        ]
      })
      expect(() => {
        dataTable.typedRowsHash()
      }).to.throw(Error)
    })

    it('accepts all supported types, case insensitive, no type given - is string', function() {
      const dataTable = new DataTable({
        rows: [
          ['k1' , 'string'  , 'value'],
          ['k2' , 'String'  , 'value'],
          ['k3' , 'str'     , 'value'],
          ['k4' , 'STR'     , 'value'],
          ['k5' , ''        , 'value'],
          ['k6' , 'Int'     , '42'],
          ['k7' , 'integer' , '42'],
          ['k8' , 'double'  , '4.2'],
          ['k9' , 'Float'   , '4.2'],
          ['k9' , 'Number'  , '0.42'],
          ['k10', 'Bool'    , 'true'],
          ['k11', 'Boolean' , 'True'],
          ['k12', 'Y/N'     , 'Y'],
          ['k13', 'y/n'     , 'y'],
          ['k14', 'bit'     , '1'],
          ['k15', 'BIT'     , 'TRUE'],
          ['k16', 'bool'    , 'n'],
          ['k17', 'bool'    , 'false'],
          ['k18', 'list'    , 'a,b,c'],
          ['k19', 'Array'   , '1,2,3'],
          ['k20', 'JSON'    , '["a",1,true]'],
          ['k21', 'Json'    , '"a string"']
        ].map( (rawRow) => ({cells : rawRow.map((value) => ({value}))}) )
      })
      expect(dataTable.typedRowsHash()).to.deep.equal( {
        k1 : 'value',
        k2 : 'value',
        k3 : 'value',
        k4 : 'value',
        k5 : 'value',
        k6 : 42,
        k7 : 42,
        k8 : 4,
        k9 : 0.42,
        k10: true,
        k11: true,
        k12: true,
        k13: true,
        k14: true,
        k15: true,
        k16: false,
        k17: false,
        k18: ['a','b','c'],
        k19: ['1','2','3'],
        k20: ['a',1,true],
        k21: 'a string'
      })
    })

    it('handles dates correctly', function () {
      const dataTable = new DataTable({
        rows: [
          {
            cells: [
              {value: 'key1'},
              {value: 'Date'},
              {value:  '2017-02-03'}
            ]
          } , {
            cells: [
              {value: 'key2'},
              {value: 'datetime'},
              {value: '2017-02-03T12:50:10'}
            ]
          }
        ]
      })
      expect(dataTable.typedRowsHash()).to.deep.equal( {
        key1 : new Date('2017-02-03'),
        key2 : new Date('2017-02-03T12:50:10')
      })
    })
  })

  describe('table without headers', function () {
    beforeEach(function () {
      this.dataTable = new DataTable({
        rows: [
          {
            cells: [
              {value: 'row 1 col 1'},
              {value: 'row 1 col 2'}
            ]
          }, {
            cells: [
              {value: 'row 2 col 1'},
              {value: 'row 2 col 2'}
            ]
          }
        ]
      })
    })

    describe('raw', function () {
      it('returns a 2-D array', function () {
        expect(this.dataTable.raw()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2']
        ])
      })
    })

    describe('rowsHash', function () {
      it('returns an object where the keys are the first column', function () {
        expect(this.dataTable.rowsHash()).to.eql({
          'row 1 col 1': 'row 1 col 2',
          'row 2 col 1': 'row 2 col 2'
        })
      })
    })
  })
})
