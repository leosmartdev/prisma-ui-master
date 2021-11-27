import { createAction, handleActions } from 'redux-actions';
import loglevel from 'loglevel';

const log = loglevel.getLogger('remotesite-config');

/** *************************************
 * Action Types
 ************************************* */
const CREATE_REMOTESITE_CONFIG = 'remotesite-config/create';
const LIST_REMOTESITE_CONFIGS = 'remotesite-config/list';
const GET_REMOTESITE_CONFIG = 'remotesite-config/get';
const UPDATE_REMOTESITE_CONFIG = 'remotesite-config/update';
const DELETE_REMOTESITE_CONFIG = 'remotesite-config/delete';

/** *************************************
 * Thunks
 ************************************* */
function createRemoteSiteConfigThunk(config) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.post('/remotesite', config).then(
        json => {
          log.info('Created a new remote site config', json);
          dispatch(createRemoteSiteConfigSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
}

function listRemoteSiteConfigsThunk() {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.get('/remotesite').then(
        json => {
          log.info('Got all remote site configs', json);
          dispatch(listRemoteSiteConfigsSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function getRemoteSiteConfigThunk(id) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.get(`/remotesite/${id}`).then(
        json => {
          log.info('Got remote site config', json);
          dispatch(getRemoteSiteConfigSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function updateRemoteSiteConfigThunk(id, config) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put(`/remotesite/${id}`, config).then(
        json => {
          log.info('Updated remote site config', json);
          dispatch(updateRemoteSiteConfigSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function deleteRemoteSiteConfigThunk(id) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.delete(`/remotesite/${id}`).then(
        json => {
          log.info('Deleted remote site config', json);
          dispatch(deleteRemoteSiteConfigSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

/** *************************************
 * Action Creators
 ************************************* */
export const createRemoteSiteConfig = createRemoteSiteConfigThunk;
export const createRemoteSiteConfigSuccess = createAction(`${CREATE_REMOTESITE_CONFIG}`);

export const listRemoteSiteConfigs = listRemoteSiteConfigsThunk;
export const listRemoteSiteConfigsSuccess = createAction(`${LIST_REMOTESITE_CONFIGS}`);

export const getRemoteSiteConfig = getRemoteSiteConfigThunk;
export const getRemoteSiteConfigSuccess = createAction(`${GET_REMOTESITE_CONFIG}`);

export const updateRemoteSiteConfig = updateRemoteSiteConfigThunk;
export const updateRemoteSiteConfigSuccess = createAction(`${UPDATE_REMOTESITE_CONFIG}`);

export const deleteRemoteSiteConfig = deleteRemoteSiteConfigThunk;
export const deleteRemoteSiteConfigSuccess = createAction(`${DELETE_REMOTESITE_CONFIG}`);

/** *************************************
 * Reducers
 ************************************* */
const initialState = {
  // List of all the remote site configs
  remoteSiteConfigs: [],
  // An editing remote site config
  currentRemoteSiteConfig: null,
};

const actionMap = {
  /** Create remote site config */
  [createRemoteSiteConfigSuccess]: (state, action) => ({
    ...state,
    remoteSiteConfigs: [
      ...state.remoteSiteConfigs,
      action.payload,
    ],
    currentRemoteSiteConfig: action.payload,
  }),
  /** List remote site configs */
  [listRemoteSiteConfigsSuccess]: (state, action) => ({
    ...state,
    remoteSiteConfigs: action.payload,
    currentRemoteSiteConfig: null,
  }),
  /** List remote site configs */
  [getRemoteSiteConfigSuccess]: (state, action) => ({
    ...state,
    currentRemoteSiteConfig: action.payload,
  }),
  /** Update remote site config */
  [updateRemoteSiteConfigSuccess]: (state, action) => {
    let remoteSiteConfigs = state.remoteSiteConfigs;
    let payload = action.payload;
    let deleteIdx = remoteSiteConfigs.findIndex(elem =>
      elem.id === payload.id
    );

    if (deleteIdx !== -1) {
      remoteSiteConfigs.splice(deleteIdx, 1, payload);
    }

    return {
      ...state,
      remoteSiteConfigs,
      currentRemoteSiteConfig: payload,
    };
  },
  /** Delete remote site config */
  [deleteRemoteSiteConfigSuccess]: (state, action) => {
    let remoteSiteConfigs = state.remoteSiteConfigs;
    let payload = action.payload;
    let deleteIdx = remoteSiteConfigs.findIndex(elem =>
      elem.id === payload.id
    );

    if (deleteIdx !== -1) {
      remoteSiteConfigs.splice(deleteIdx, 1);
    }

    return {
      ...state,
      remoteSiteConfigs,
    };
  },
};

export const reducer = handleActions(
  {
    ...actionMap,
  },
  initialState,
);

export const init = store => {
  store.addReducer('remoteSiteConfig', reducer);
  // add epics here
};
