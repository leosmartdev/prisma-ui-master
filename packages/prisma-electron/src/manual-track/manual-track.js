import { createAction, handleActions } from 'redux-actions';

const initialState = {
  enabled: false,
  latitude: "0",
  longitude: "0",
};

const addThunk = params => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.post('/track', params).then(
      () => {
        resolve();
      },
      error => {
        console.log('error', error);
        reject(error);
      }
    )
  });
};

export const add = addThunk;
export const enable = createAction('manualTrack/enable');
export const disable = createAction('manualTrack/disable');
export const setLatitude = createAction('manualTrack/setLatitude');
export const setLongitude = createAction('manualTrack/setLongitude');
export const setCoordinate = createAction('manualTrack/setCoordinate');

export const reducer = handleActions(
  {
    [enable]: (state, action) => ({
      ...state,
      enabled: true
    }),
    [disable]: (state, action) => ({
      ...state,
      enabled: false
    }),
    [setLatitude]: (state, action) => ({
      ...state,
      latitude: action.payload
    }),
    [setLongitude]: (state, action) => ({
      ...state,
      longitude: action.payload
    }),
    [setCoordinate]: (state, action) => ({
      ...state,
      latitude: action.payload.latitude,
      longitude: action.payload.longitude,
    })
  },
  initialState
);

export const init = store => {
  store.addReducer('manualTrack', reducer);
};
