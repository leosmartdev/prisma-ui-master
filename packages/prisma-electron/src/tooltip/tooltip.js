import { createAction, handleActions } from 'redux-actions';
import loglevel from 'loglevel';
import moment from 'moment';

const log = loglevel.getLogger('tooltip');

const defaultState = {
  id: null,
  info: null,
  loading: false,
  error: null,
};

const getInfoThunk = (id, type, trackId) => (dispatch, getState) => {
  dispatch(loading(id));
  const server = getState().server;
  // HACK: The history endpoint was changed and no longer works as before.
  // Redirect to another endpoint that has the old behavior.
  if (type === 'history') {
    type = 'history-database';
  }
  server.get(`/${type}/${id}`).then(
    response => {
      if (id === response.id) {
        if (response.registry && response.registry.incidents && response.registry.incidents.length > 0) {
          loadIncidents(dispatch, getState, response, trackId);
        } else {
          console.log(response);
          dispatch(success(response));
        }
      }
    },
    error => {
      dispatch(failure(error));
    },
  );
};

// If there are SARSAT incidents in the information obtained from the server,
// it won't contain the actual incidents and only the identifiers. Now fetch
// the actual incident info and attach it to the info object separately
function loadIncidents(dispatch, getState, info, trackId) {
  let incidentIds = info.registry.incidents;
  info.incidents = [];
  let promises = [];
  const server = getState().server;
  for (let id of incidentIds) {
    promises.push(server.get(`/incident/${id}`).then(
      response => info.incidents.push(response)
    ))
  }
  if (trackId) {
    promises.push(server.get(`/track/${trackId}`, {first: "true"}).then(
      response => info.firstReportedTime = moment(response.target.time)
    ));
  }
  Promise.all(promises).then(
    () => {
      dispatch(success(info));
    },
    error => {
      dispatch(failure(error));
    }
  )
}

export const get = getInfoThunk;
export const loading = createAction('tooltip/loading');
export const success = createAction('tooltip/success');
export const failure = createAction('tooltip/failure');
export const clear = createAction('tooltip/clear');

export const reducer = handleActions(
  {
    [loading]: (state, action) => ({
      ...state,
      id: action.payload,
      loading: true,
    }),
    [success]: (state, action) => ({
      ...state,
      info: action.payload,
      loading: false,
      error: null,
    }),
    [failure]: (state, action) => ({
      ...state,
      info: null,
      loading: false,
      error: action.payload,
    }),
    [clear]: state => ({
      ...state,
      id: null,
      info: null,
      loading: false,
      error: null,
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('tooltip', reducer);
};
