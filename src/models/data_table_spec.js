import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import DataTable from './data_table'

describe('DataTable', () => {
  describe('table with headers', () => {
    beforeEach(function() {
      this.dataTable = new DataTable({
        rows: [
          {
            cells: [{ value: 'header 1' }, { value: 'header 2' }],
          },
          {
            cells: [{ value: 'row 1 col 1' }, { value: 'row 1 col 2' }],
          },
          {
            cells: [{ value: 'row 2 col 1' }, { value: 'row 2 col 2' }],
          },
        ],
      })
    })

    describe('rows', () => {
      it('returns a 2-D array without the header', function() {
        expect(this.dataTable.rows()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2'],
        ])
      })
    })

    describe('hashes', () => {
      it('returns an array of object where the keys are the headers', function() {
        expect(this.dataTable.hashes()).to.eql([
          { 'header 1': 'row 1 col 1', 'header 2': 'row 1 col 2' },
          { 'header 1': 'row 2 col 1', 'header 2': 'row 2 col 2' },
        ])
      })
    })
  })

  describe('table without headers', () => {
    beforeEach(function() {
      this.dataTable = new DataTable({
        rows: [
          {
            cells: [{ value: 'row 1 col 1' }, { value: 'row 1 col 2' }],
          },
          {
            cells: [{ value: 'row 2 col 1' }, { value: 'row 2 col 2' }],
          },
        ],
      })
    })

    describe('raw', () => {
      it('returns a 2-D array', function() {
        expect(this.dataTable.raw()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2'],
        ])
      })
    })

    describe('rowsHash', () => {
      it('returns an object where the keys are the first column', function() {
        expect(this.dataTable.rowsHash()).to.eql({
          'row 1 col 1': 'row 1 col 2',
          'row 2 col 1': 'row 2 col 2',
        })
      })
    })
  })
})
