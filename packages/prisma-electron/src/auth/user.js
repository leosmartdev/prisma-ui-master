import { handleActions, createAction } from 'redux-actions';

const loadAllThunk = (opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.get('/auth/user', opts.params, opts);
};

const loadThunk = (userId, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.get(`/auth/user/${userId}`, opts.params, opts);
};

const createThunk = (user, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.post('/auth/user', user, opts.params, opts);
};

const updateThunk = (user, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.put(`/auth/user/${user.userId}`, user, opts.params, opts);
};

const updateStateThunk = (user, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.put(`/auth/user/${user.userId}/state/${user.state}`, user, opts.params, opts);
};

const removeThunk = (userId, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.delete(`/auth/user/${userId}`, userId, opts.params, opts);
};

/**
 * Actions
 */
const AuditLog = 'Audit';
const ReadAuditLog = `${AuditLog}/READ`;
const ReadAuditLogSuccess = createAction(`${ReadAuditLog}:success`, records => records);

/**
 * Action Creators
 */
export const loadAll = loadAllThunk;
export const load = loadThunk;
export const create = createThunk;
export const update = updateThunk;
export const updateState = updateStateThunk;
export const remove = removeThunk;
export const readAuditLog = (path="/auth/audit", params={}, all=false, limit=40,) => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    if (all == true) {
      delete params['limit'];
    }

    if (all == false && !params['limit']) {
      params['limit'] = limit;
    }

    server.get(path, params).then(
      response => {
        dispatch(ReadAuditLogSuccess(response));
        resolve(response);
      },
      err => {
        reject(err);
      },
    );
  });  
};

/**
 * State
 */
const initialState = {};
export const reducer = handleActions(
  {
    [ReadAuditLogSuccess]: (state, action) => ({
      ...state,
      records: action.payload,
    }),
  },
  initialState,
);

/**
 * Initialization
 */

export const init = store => {
  store.addReducer('user', reducer);
};
