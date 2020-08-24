import { describe, it } from 'mocha'
import { expect } from 'chai'
import DataTable from './data_table'
import { messages } from '@cucumber/messages'

describe('DataTable', () => {
  describe('table with headers', () => {
    const dataTable = messages.GherkinDocument.Feature.Step.DataTable.fromObject(
      {
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
      }
    )

    describe('rows', () => {
      it('returns a 2-D array without the header', () => {
        expect(new DataTable(dataTable).rows()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2'],
        ])
      })
    })

    describe('hashes', () => {
      it('returns an array of object where the keys are the headers', () => {
        expect(new DataTable(dataTable).hashes()).to.eql([
          { 'header 1': 'row 1 col 1', 'header 2': 'row 1 col 2' },
          { 'header 1': 'row 2 col 1', 'header 2': 'row 2 col 2' },
        ])
      })
    })

    describe('transpose', () => {
      it('returns a new DataTable, with the data transposed', () => {
        expect(new DataTable(dataTable).transpose().raw()).to.eql([
          ['header 1', 'row 1 col 1', 'row 2 col 1'],
          ['header 2', 'row 1 col 2', 'row 2 col 2'],
        ])
      })
    })
  })

  describe('table without headers', () => {
    const dataTable = messages.GherkinDocument.Feature.Step.DataTable.fromObject(
      {
        rows: [
          {
            cells: [{ value: 'row 1 col 1' }, { value: 'row 1 col 2' }],
          },
          {
            cells: [{ value: 'row 2 col 1' }, { value: 'row 2 col 2' }],
          },
        ],
      }
    )

    describe('raw', () => {
      it('returns a 2-D array', () => {
        expect(new DataTable(dataTable).raw()).to.eql([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2'],
        ])
      })
    })

    describe('rowsHash', () => {
      it('returns an object where the keys are the first column', () => {
        expect(new DataTable(dataTable).rowsHash()).to.eql({
          'row 1 col 1': 'row 1 col 2',
          'row 2 col 1': 'row 2 col 2',
        })
      })
    })
  })

  describe('table with something other than 2 columns', () => {
    const dataTable = messages.GherkinDocument.Feature.Step.DataTable.fromObject(
      {
        rows: [
          {
            cells: [{ value: 'row 1 col 1' }],
          },
          {
            cells: [{ value: 'row 2 col 1' }],
          },
        ],
      }
    )

    describe('rowsHash', () => {
      it('throws an error if not all rows have two columns', function () {
        expect(() => new DataTable(dataTable).rowsHash()).to.throw(
          'rowsHash can only be called on a data table where all rows have exactly two columns'
        )
      })
    })
  })
})
