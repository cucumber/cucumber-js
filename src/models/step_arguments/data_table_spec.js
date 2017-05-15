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
      try {
        dataTable.typedRowsHash()
      } catch (err) {
        expect(err.message).to.match(/typedRowsHash can only be used on a data table where all rows have exactly 3 columns/)
        return
      }
      throw new Error('did not throw error for row that lacks columns')
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
              {value: 'OUPS'}, //<--- 1st No such type
              {value: 'some value'}
            ]
          } , {
            cells: [
              {value: 'key3'},
              {value: 'string'},
              {value: 'value'}
            ]
          } , {
            cells: [
              {value: 'key3'},
              {value: 'AYAYAYAYAY'}, //<--- 2nd No such type
              {value: 'value'}
            ]
          }
        ]
      })

      try {
        dataTable.typedRowsHash()
      } catch (err) {
        expect(err.message).to.match(/typedRowsHash does not support type\(s\) in rows/)
        const rows = err.message.split(/\n/).slice(1)
        expect(rows.length).to.eql(2) //formatted row per rejected row
        expect(rows[0].length).to.eql(rows[1].length) //formatted awsomely
        return
      }
      throw new Error('did not throw error for unrecognized type')
    })

    it('reads value as string when no type is given', function() {
      const dataTable = new DataTable({
        rows: [
          ['k5' , ''        , 'some value'],
          ['j5' , ''        , 'other value']
        ].map( (rawRow) => ({cells : rawRow.map((value) => ({value}))}) )
      })
      expect(dataTable.typedRowsHash()).to.deep.equal({
        k5 : 'some value',
        j5 : 'other value'
      })
    })

    it('accept strings, type column is case insensitive', function() {
      const dataTable = new DataTable({
        rows: [
          ['k1' , 'string'  , 'value'],
          ['k2' , 'String'  , 'value'],
          ['k3' , 'STRING'  , 'value']
        ].map( (rawRow) => ({cells : rawRow.map((value) => ({value}))}) )
      })
      expect(dataTable.typedRowsHash()).to.deep.equal({
        k1 : 'value',
        k2 : 'value',
        k3 : 'value'
      })
    })

    it('accept numbers, lets user\'s PO document a concrete type (although JS does not care), type column is case insensitive', function() {
      const dataTable = new DataTable({
        rows: [
          ['k60', 'int'     , '42'],
          ['k61', 'Int'     , '42'],
          ['k62', 'INT'     , '42'],
          ['k70', 'Integer' , '42'],
          ['k71', 'integer' , '42'],
          ['k72', 'INTEGER' , '42'],
          ['k80', 'double'  , '4.2'],
          ['k81', 'Double'  , '4.2'],
          ['k82', 'DOUBLE'  , '4.2'],
          ['k90', 'float'   , '4.2'],
          ['k91', 'Float'   , '4.2'],
          ['k92', 'FLOAT'   , '4.2'],
          ['k00', 'number'  , '0.42'],
          ['k01', 'Number'  , '0.42'],
          ['k02', 'NUMBER'  , '0.42']
        ].map( (rawRow) => ({cells : rawRow.map((value) => ({value}))}) )
      })
      expect(dataTable.typedRowsHash()).to.deep.equal({
        k60: 42,
        k61: 42,
        k62: 42,
        k70: 42,
        k71: 42,
        k72: 42,
        k80: 4,
        k81: 4,
        k82: 4,
        k90: 4.2,
        k91: 4.2,
        k92: 4.2,
        k00: 0.42,
        k01: 0.42,
        k02: 0.42
      })
    })

    it('accepts boolean values, lets user use his non-tech PO\'s favorite jargone, type column is case insensitive', function() {
      const dataTable = new DataTable({
         rows: [
          ['k10', 'Bool'    , 'true'],
          ['k11', 'Boolean' , 'True'],
          ['k12', 'Y/N'     , 'Y'],
          ['k13', 'y/n'     , 'y'],
          ['k14', 'bit'     , '1'],
          ['k15', 'BIT'     , 'TRUE'],
          ['k16', 'bool'    , 'n'],
          ['k17', 'bool'    , 'false']
        ].map( (rawRow) => ({cells : rawRow.map((value) => ({value}))}) )
       })
      expect(dataTable.typedRowsHash()).to.deep.equal({
        k10: true,
        k11: true,
        k12: true,
        k13: true,
        k14: true,
        k15: true,
        k16: false,
        k17: false
      })
    })

    it('accepts lists, lets user communicate with non-tech PO anyhow they like, type column is case insensitive', function() {
      const dataTable = new DataTable({
        rows: [
          ['k180', 'list'    , 'a,b,c'],
          ['k181', 'List'    , 'a,b,c'],
          ['k182', 'LIST'    , 'a,b,c'],
          ['k190', 'array'   , '1,2,3'],
          ['k191', 'Array'   , '1,2,3'],
          ['k192', 'ARRAY'   , '1,2,3']
        ].map( (rawRow) => ({cells : rawRow.map((value) => ({value}))}) )
      })
      expect(dataTable.typedRowsHash()).to.deep.equal({
        k180: ['a','b','c'],
        k181: ['a','b','c'],
        k182: ['a','b','c'],
        k190: ['1','2','3'],
        k191: ['1','2','3'],
        k192: ['1','2','3']
      })
    })

    it('accepts JSON, type column is case insensitive', function() {
      const dataTable = new DataTable({
        rows: [
          ['k20', 'JSON'    , '["a",1,true]'],
          ['k21', 'Json'    , '"a string"'],
          ['k22', 'json'    , '{"answer":42}']
        ].map( (rawRow) => ({cells : rawRow.map((value) => ({value}))}) )
      })
      expect(dataTable.typedRowsHash()).to.deep.equal({
        k20: ['a',1,true],
        k21: 'a string',
        k22: {answer: 42}
      })
    })

    it('handles dates correctly, lets user document concrete type (although JS does not care), column type is case insensitive', function () {
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
