import Rx from 'rx';
import Cycle from '@cycle/core';
import React from 'react';
import ReactDOM from 'react-dom';

import {makeLocalStorageDriver} from './drivers/localstorage-driver';
import {
  cellStyle,
  buttonCellStyle,
  rowStyle,
  rowsStyle,
  addButtonStyle,
  editButtonStyle,
  removeButtonStyle,
  cancelButtonStyle,
  updateButtonStyle,
  preCodeStyle
} from './styles';
import prepareRow from './utils/prepare-row';

const Intent = {
  addRow: new Rx.Subject(),
  editRow: new Rx.Subject(),
  removeRow: new Rx.Subject(),
  updateRow: new Rx.Subject(),
  cancelRow: new Rx.Subject(),
  updateEditRegion: new Rx.Subject(),
  updateEditCity: new Rx.Subject(),
  updateEditLength: new Rx.Subject(),
  updateEditDefaultFrom: new Rx.Subject(),
  updateEditDefaultLimit: new Rx.Subject()
};

const Actions = {
  addRow: (index) => (() => Intent.addRow.onNext(index)),
  editRow: (index) => (() => Intent.editRow.onNext(index)),
  removeRow: (index) => (() => Intent.removeRow.onNext(index)),
  updateRow: (index) => (() => Intent.updateRow.onNext(index)),
  cancelRow: (index) => (() => Intent.cancelRow.onNext(index)),
  rowKeyUp: (index) => (e) => {
    switch(e.keyCode) {
      case 13:
        Intent.updateRow.onNext(index);
        break;
      case 27:
        Intent.cancelRow.onNext(index);
        break;
    }
  },
  updateEditRegion: (e) => Intent.updateEditRegion.onNext(e.target.value),
  updateEditCity: (e) => Intent.updateEditCity.onNext(e.target.value),
  updateEditLength: (e) => Intent.updateEditLength.onNext(e.target.value),
  updateEditDefaultFrom: (e) => Intent.updateEditDefaultFrom.onNext(e.target.value),
  updateEditDefaultLimit: (e) => Intent.updateEditDefaultLimit.onNext(e.target.value),
};

function formatDate(a) {
  return `${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`;
}

function rowView(editing, editProps) {
  return (row, index) => {
    let {
      region,
      city,
      length,
      from,
      to,
      limit
    } = row;

    if (editing === index) {
      return (
        <div className={rowStyle.className} key={`row${index}`}
          onKeyUp={Actions.rowKeyUp(index)}>
          <div className={cellStyle.className}>
            <input value={editProps.region} onChange={Actions.updateEditRegion}/>
          </div>
          <div className={cellStyle.className}>
            <input value={editProps.city} onChange={Actions.updateEditCity}/>
          </div>
          <div className={cellStyle.className}>
            <input value={editProps.length} onChange={Actions.updateEditLength}/>
          </div>
          <div className={cellStyle.className}>
            <input value={editProps.defaultFrom instanceof Date ? formatDate(editProps.defaultFrom) : editProps.defaultFrom}
              onChange={Actions.updateEditDefaultFrom}
            />
          </div>
          <div className={cellStyle.className}>{formatDate(to)}</div>
          <div className={cellStyle.className}>
            <input value={editProps.defaultLimit} onChange={Actions.updateEditDefaultLimit}/>
          </div>
          <div className={buttonCellStyle.className}>
            <button className={cancelButtonStyle.className}
              onClick={Actions.cancelRow(index)}>cancel edit</button>
          </div>
          <div className={buttonCellStyle.className}>
            <button className={updateButtonStyle.className}
              onClick={Actions.updateRow(index)}>update row</button>
          </div>
          <div className={buttonCellStyle.className}>
            <button className={removeButtonStyle.className}
              onClick={Actions.removeRow(index)}>remove row</button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={rowStyle.className} key={`row${index}`}>
          <div className={cellStyle.className}>{region}</div>
          <div className={cellStyle.className}>{city}</div>
          <div className={cellStyle.className}>{length}</div>
          <div className={cellStyle.className}>{formatDate(from)}</div>
          <div className={cellStyle.className}>{formatDate(to)}</div>
          <div className={cellStyle.className}>{limit}</div>
          <div className={buttonCellStyle.className}>
            <button className={addButtonStyle.className}
              onClick={Actions.addRow(index)}>add row</button>
          </div>
          <div className={buttonCellStyle.className}>
            <button className={editButtonStyle.className}
              onClick={Actions.editRow(index)}>edit row</button>
          </div>
          <div className={buttonCellStyle.className}>
            <button className={removeButtonStyle.className}
              onClick={Actions.removeRow(index)}>remove row</button>
          </div>
        </div>
      );
    }
  };
}

function view(state$) {
  return state$.map((state) => {
    return (
      <div>
        <h1>Simple Trip Planner</h1>
        <div className={rowsStyle.className}>
          <div className={rowStyle.className}>
            <div className={cellStyle.className}><strong>region</strong></div>
            <div className={cellStyle.className}><strong>city</strong></div>
            <div className={cellStyle.className}><strong>length</strong></div>
            <div className={cellStyle.className}><strong>from</strong></div>
            <div className={cellStyle.className}><strong>to</strong></div>
            <div className={cellStyle.className}><strong>limit</strong></div>
          </div>
          {state.processedRows.map(rowView(state.editing, state.editProps))}
        </div>
        <small>Run <pre className={preCodeStyle.className}>localStorage.removeItem('SimpleTravelPlanner.savedState')</pre> to reset</small>
      </div>
    )
  });
}

function main(drivers) {


  const state$ = Rx.Observable
    .merge(
      drivers.LS,
      Intent.addRow.map((index) => (state) => {
        let {rows} = state;
        let newRows = rows.slice(0, index + 1)
          .concat(prepareRow(rows[index].region))
          .concat(rows.slice(index + 1))

        return Object.assign({}, state, {
          rows: newRows,
          editing: index + 1
        });
      }),
      Intent.editRow.map((index) => (state) => {
        return Object.assign({}, state, {
          editing: index,
          editProps: state.rows[index]
        });
      }),
      Intent.removeRow.map((index) => (state) => {
        let {rows} = state;
        let newRows = rows.slice(0, index).concat(rows.slice(index + 1))

        if (newRows.length === 0) {
          newRows.push(prepareRow('You need at least one row!'));
        }

        return Object.assign({}, state, {
          rows: newRows,
          editing: null
        });
      }),
      Intent.updateRow.map((index) => (state) => {
        let newRows = state.rows.map((row, i) => {
          if (i === index) {
            try {
              let {
                region,
                city,
                length,
                defaultFrom,
                defaultLimit
              } = state.editProps;

              if (defaultFrom.length !== 0) {
                defaultFrom = new Date(defaultFrom);
              } else {
                defaultFrom = null;
              }

              if (defaultLimit.length !== 0) {
                defaultLimit = parseInt(defaultLimit);
              } else {
                defaultLimit = null;
              }

              return prepareRow(
                region,
                city,
                length,
                defaultFrom,
                defaultLimit
              );
            } catch(e) {
              console.error('errorrrrr');
              return row;
            }
          } else {
            return row;
          }
        });

        return Object.assign({}, state, {
          rows: newRows,
          editing: null,
          editProps: null
        });
      }),
      Intent.cancelRow.map(() => (state) => {
        return Object.assign({}, state, {
          editing: null,
          editProps: null
        });
      }),
      Intent.updateEditRegion.map((region) => (state) => Object.assign({}, state, {
        editProps: Object.assign({}, state.editProps, {
          region
        })
      })),
      Intent.updateEditCity.map((city) => (state) => Object.assign({}, state, {
        editProps: Object.assign({}, state.editProps, {
          city
        })
      })),
      Intent.updateEditLength.map((length) => (state) => Object.assign({}, state, {
        editProps: Object.assign({}, state.editProps, {
          length
        })
      })),
      Intent.updateEditDefaultFrom.map((defaultFrom) => (state) => Object.assign({}, state, {
        editProps: Object.assign({}, state.editProps, {
          defaultFrom
        })
      })),
      Intent.updateEditDefaultLimit.map((defaultLimit) => (state) => Object.assign({}, state, {
        editProps: Object.assign({}, state.editProps, {
          defaultLimit
        })
      }))
    )
    .scan((state, reducer) => reducer(state))
    .map((state) => {
      let processedRows = state.rows.reduce((agg, row) => {
        let {
          region,
          city,
          length = 0,
          defaultFrom,
          defaultLimit
        } = row;

        let limit = defaultLimit;
        let from = defaultFrom;
        let to;

        if (Number.isInteger(limit)) {
          limit = limit - length;
        } else {
          if (Number.isInteger(agg.previousLimit) && region === agg.previousRegion) {
            limit = agg.previousLimit - length;
          } else {
            limit = null;
          }
        }

        if (!(from instanceof Date)) {
          from = new Date(agg.previousDate.valueOf());
        }

        if (length) {
          to = new Date(from.valueOf());
          to.setDate(from.getDate() + length);
        } else {
          to = from;
        }

        return {
          previousRegion: region,
          previousLimit: limit,
          previousDate: to,
          processedRows: agg.processedRows.concat({
            region,
            city,
            length,
            from,
            to,
            limit
          })
        };
      }, {
        previousRegion: null,
        previousLimit: null,
        previousDate: new Date(),
        processedRows: []
      }).processedRows;

      return Object.assign({}, state, {processedRows});
    });

  state$.subscribe(state => console.log('state', state));

  return {
    React: view(state$),
    LS: state$
  };
}

let myDiv = document.createElement('div');
myDiv.id = 'app';
document.body.appendChild(myDiv);

const drivers = {
  React: (reactElement$) => reactElement$.subscribe((reactElement) => ReactDOM.render(reactElement, document.getElementById('app'))),
  LS: makeLocalStorageDriver(),
  Intent: () => Intent
};

Cycle.run(main, drivers);
