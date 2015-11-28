import prepareRow from '../utils/prepare-row';

const simpleTravelPlannerLSKey = 'SimpleTravelPlanner.savedState';

const defaultState = {
  editing: null,
  editProps: {},
  rows: [
    prepareRow('Japan', 'Tokyo',	3, new Date('1/7/2016'), 90),
    prepareRow('Japan', 'Nagoya', 7),
    prepareRow('Japan', 'Osaka', 7),
    prepareRow('Japan', 'Kyoto', 14),
    prepareRow('Japan', 'Tokyo', 14)
  ]
};

export function makeLocalStorageDriver () {
  return function localStorageDriver (newState$) {
    newState$.subscribe(function (newState) {
      localStorage.setItem(simpleTravelPlannerLSKey, JSON.stringify(newState));
    });

    return Rx.Observable.just(JSON.parse(localStorage.getItem(simpleTravelPlannerLSKey)) || defaultState);
  };
}
