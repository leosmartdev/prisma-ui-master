import { createAction, handleActions } from 'redux-actions';

const initialState = {
  zones: [],
  editing: null,
  fillColor: {
    r: 255,
    g: 0,
    b: 0,
    a: 0.25,
  },
  fillPattern: 'solid',
  strokeColor: { r: 0, g: 0, b: 0 },
  updating: false,
  error: null,
  areaSelector: false,
  areaObject: null,
};

/** *************************************
 * Action Creators
 ************************************* */
export const createZone = createAction('zones/create');
export const editZone = createAction('zones/edit', feature => feature);
export const clearError = createAction('zones/clearError');
export const changeFillColor = createAction('zones/changeFillColor');
export const changeFillPattern = createAction('zones/changeFillPattern');
export const changeStrokeColor = createAction('zones/changeStrokeColor');
export const updating = createAction('zones/updating');
export const success = createAction('zones/success');
export const failure = createAction('zones/failure');
export const receiveZoneUpdate = createAction('Zone/UPDATE');
export const receiveZoneDelete = createAction('Zone/DELETE');

/** *************************************
 * Thunks
 ************************************* */
export const sendUpsert = zone => (dispatch, getState) => {
  const { server } = getState();
  dispatch(updating());
  server.post('/zone', zone).then(
    () => {
      dispatch(success());
    },
    error => {
      dispatch(failure(error));
    },
  );
};

export const sendDelete = id => (dispatch, getState) => {
  const { server } = getState();
  dispatch(updating());
  server.delete(`/zone/${id}`).then(
    () => {
      dispatch(success());
    },
    error => {
      dispatch(failure(error));
    },
  );
};

/** *************************************
 * Reducers
 ************************************* */

const updateInZoneList = (list, zone) => {
  const newList = list.slice();
  const i = newList.findIndex(e => zone.databaseId === e.databaseId);
  if (i < 0) {
    newList.push(zone);
    newList.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    newList[i] = zone;
  }
  return newList;
};

const removeFromZoneList = (list, zone) => {
  const newList = list.slice();
  const i = newList.findIndex(e => zone.databaseId === e.databaseId);
  if (i >= 0) {
    newList.splice(i, 1);
  }
  return newList;
};

export const reducer = handleActions(
  {
    [createZone]: state => ({
      ...state,
      editing: null,
    }),
    [editZone]: (state, action) => ({
      ...state,
      editing: action.payload,
      fillColor: action.payload.fillColor,
      fillPattern: action.payload.fillPattern,
      strokeColor: action.payload.strokeColor,
    }),
    [changeFillColor]: (state, action) => ({
      ...state,
      fillColor: action.payload,
    }),
    [changeFillPattern]: (state, action) => ({
      ...state,
      fillPattern: action.payload,
    }),
    [changeStrokeColor]: (state, action) => ({
      ...state,
      strokeColor: action.payload,
    }),
    [updating]: state => ({
      ...state,
      updating: true,
    }),
    [success]: state => ({
      ...state,
      updating: false,
    }),
    [failure]: (state, action) => ({
      ...state,
      updating: false,
      error: action.payload,
    }),
    [clearError]: state => ({
      ...state,
      error: null,
    }),
    [receiveZoneUpdate]: (state, action) => ({
      ...state,
      zones: updateInZoneList(state.zones, action.payload),
    }),
    [receiveZoneDelete]: (state, action) => ({
      ...state,
      zones: removeFromZoneList(state.zones, action.payload),
    }),
  },
  initialState,
);

export function init(store) {
  store.addReducer('zones', reducer);
}
