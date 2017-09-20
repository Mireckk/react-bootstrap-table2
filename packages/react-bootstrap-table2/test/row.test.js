import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Cell from '../src/cell';
import Row from '../src/row';
import Const from '../src/const';
import EditingCell from '../src/editing-cell';

const defaultColumns = [{
  dataField: 'id',
  text: 'ID'
}, {
  dataField: 'name',
  text: 'Name'
}, {
  dataField: 'price',
  text: 'Price'
}];

describe('Row', () => {
  let wrapper;

  const row = {
    id: 1,
    name: 'A',
    price: 1000
  };

  describe('simplest row', () => {
    beforeEach(() => {
      wrapper = shallow(
        <Row rowIndex={ 1 } columns={ defaultColumns } row={ row } cellEdit={ {} } />);
    });

    it('should render successfully', () => {
      expect(wrapper.length).toBe(1);
      expect(wrapper.find('tr').length).toBe(1);
      expect(wrapper.find(Cell).length).toBe(Object.keys(row).length);
    });
  });

  describe('when cellEdit prop is defined', () => {
    let columns;
    let cellEdit;
    const rowIndex = 1;
    const keyField = 'id';

    beforeEach(() => {
      columns = defaultColumns;
      cellEdit = {
        mode: Const.CLICK_TO_CELL_EDIT
      };
      wrapper = shallow(
        <Row
          row={ row }
          rowIndex={ rowIndex }
          columns={ columns }
          keyField={ keyField }
          cellEdit={ cellEdit }
        />
      );
    });

    afterEach(() => {
      columns = undefined;
      cellEdit = undefined;
    });

    it('Cell component should receive correct editable props', () => {
      expect(wrapper.length).toBe(1);
      for (let i = 0; i < columns.length; i += 1) {
        const column = columns[i];
        if (column.dataField === keyField) {
          expect(wrapper.find(Cell).get(i).props.editable).toBeFalsy();
        } else {
          expect(wrapper.find(Cell).get(i).props.editable).toBeTruthy();
        }
      }
    });

    it('Cell component should receive correct editMode props', () => {
      expect(wrapper.length).toBe(1);
      for (let i = 0; i < columns.length; i += 1) {
        expect(wrapper.find(Cell).get(i).props.editMode).toEqual(cellEdit.mode);
      }
    });

    describe('when have column.editable defined false', () => {
      const nonEditableColIndex = 1;
      beforeEach(() => {
        columns[nonEditableColIndex].editable = false;
        wrapper = shallow(
          <Row
            row={ row }
            rowIndex={ rowIndex }
            columns={ columns }
            keyField={ keyField }
            cellEdit={ cellEdit }
          />
        );
      });

      it('Cell component should receive correct editMode props', () => {
        expect(wrapper.length).toBe(1);
        for (let i = 0; i < columns.length; i += 1) {
          const column = columns[i];
          if (i === nonEditableColIndex || column.dataField === keyField) {
            expect(wrapper.find(Cell).get(i).props.editable).toBeFalsy();
          } else {
            expect(wrapper.find(Cell).get(i).props.editable).toBeTruthy();
          }
        }
      });
    });

    // Means user defined cellEdit.nonEditableRows
    // and some rows will be treated as noneditable by this rules
    describe('when editable prop is false', () => {
      beforeEach(() => {
        wrapper = shallow(
          <Row
            row={ row }
            rowIndex={ rowIndex }
            columns={ columns }
            keyField={ keyField }
            cellEdit={ cellEdit }
            editable={ false }
          />
        );
      });

      it('All the Cell components should be noneditable', () => {
        expect(wrapper.length).toBe(1);
        for (let i = 0; i < columns.length; i += 1) {
          expect(wrapper.find(Cell).get(i).props.editable).toBeFalsy();
        }
      });
    });

    // Means a cell now is undering editing
    describe('when cellEdit.ridx and cellEdit.cidx is defined', () => {
      describe('and cellEdit.ridx is match to current row index', () => {
        const editingColIndex = 1;
        beforeEach(() => {
          cellEdit.ridx = rowIndex;
          cellEdit.cidx = editingColIndex;
          cellEdit.onComplete = sinon.stub();
          cellEdit.onEscape = sinon.stub();
          wrapper = shallow(
            <Row
              row={ row }
              rowIndex={ 1 }
              columns={ columns }
              keyField={ keyField }
              cellEdit={ cellEdit }
              editable={ false }
            />
          );
        });

        it('should render EditingCell correctly', () => {
          expect(wrapper.length).toBe(1);
          expect(wrapper.find(EditingCell).length).toBe(1);
          expect(wrapper.find('tr').children().at(editingColIndex).type()).toEqual(EditingCell);
        });
      });

      describe('and cellEdit.ridx is not match to current row index', () => {
        const editingColIndex = 1;
        beforeEach(() => {
          cellEdit.ridx = 3;
          cellEdit.cidx = editingColIndex;
          cellEdit.onComplete = sinon.stub();
          cellEdit.onEscape = sinon.stub();
          wrapper = shallow(
            <Row
              row={ row }
              rowIndex={ 1 }
              columns={ columns }
              keyField={ keyField }
              cellEdit={ cellEdit }
              editable={ false }
            />
          );
        });

        it('should not render any EditingCell component', () => {
          expect(wrapper.length).toBe(1);
          expect(wrapper.find(EditingCell).length).toBe(0);
          expect(wrapper.find(Cell).length).toBe(columns.length);
        });
      });
    });
  });
});