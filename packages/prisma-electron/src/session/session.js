import { createAction } from 'redux-actions';
import { URI } from 'swagger-router';
import loglevel from 'loglevel';

import * as transaction from 'server/transaction';
import * as noticeActions from 'notices/notices';
import * as incidentActions from 'incident/incident';
import * as markerActions from 'marker/marker';
import * as messageActions from 'message/message';

const wsLog = loglevel.getLogger('ws');
const timeBatchUp = 2000;

export const isEquivalent = (a, b) => {
  if (!(a instanceof Object) || !(b instanceof Object)) {
    return false;
  }
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);
  // If number of properties is different, objects are not equivalent
  if (aProps.length !== bProps.length) {
    return false;
  }
  for (const propName of aProps) {
    // If values of same property are not equal, objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  // If we made it this far, objects are considered equivalent
  return true;
};

/** *************************************
 * Action Types
 ************************************* */
const UPDATE_USER = 'Profile/UPDATE';
const READ_SESSION_SUCCESS = 'Session/READ:success';
const CREATE_SESSION_SUCCESS = 'Session/CREATE:success';
const CREATE_SESSION_FAILURE = 'Session/CREATE:failure';
const TERMINATE_SESSION_SUCCESS = 'Session/TERMINATE:success';
const TERMINATE_SESSION = 'Session/TERMINATE';
const IDLE_SESSION = 'Session/IDLE';
const SET_SOCKET = 'session/setSocket';
const CLEAR_SOCKET = 'session/clearSocket';
const SOCKET_ERROR = 'session/socketError';
const CONNECTION_FAILURE = 'Session/READ:failure-connection';
const CONNECTION_SUCCESS = 'Session/READ:success';

/** *************************************
 * Thunks
 ************************************* */
let delay = 100;
const getSessionThunk = () => (dispatch, getState) => {
  const server = getState().server;
  server.get('/auth/session').then(
    payload => {
      dispatch(getSessionSuccess(payload));
      dispatch(openWebSocket());
    },
    error => {
      if (error.error && error.error.message === 'Failed to fetch') {
        dispatch(connectionError(error));
        delay = delay > 30000 ? 30000 : delay * 2;
        setTimeout(() => {
          dispatch(getSession());
        }, delay);
      } else {
        delay = 100;
        dispatch(connectionSuccess());
      }
    },
  );
};

const createSessionThunk = (transactionId, payload) => (dispatch, getState) => {
  const server = getState().server;
  const uri = new URI('/api/v2/auth/session');
  return server.post(uri, payload).then(
    response => {
      dispatch(createSessionSuccess(response));
      dispatch(openWebSocket());
      dispatch(transaction.transactionSuccess(transactionId, response));
    },
    error => {
      dispatch(transaction.transactionFailure(transactionId, error));
      dispatch(createSessionFailure(error));
    },
  );
};

const deleteSessionThunk = () => (dispatch, getState) => {
  const server = getState().server;
  return server.delete('/auth/session').then(() => {
    dispatch(deleteSessionSuccess());
    dispatch(closeWebSocket());
  });
};

const openWebSocketThunk = () => (dispatch, getState) => {
  // Close the connection, if open.
  if (getState().session.socket && getState().session.socket.readyState === WebSocket.OPEN) {
    getState().session.socket.close();
  }
  if (getState().session.state === 'idled') {
    wsLog.info('websocket', 'session is idle');
    return;
  }
  const server = getState().server;
  const socket = server.socket('/');

  socket.onopen = () => {
    socket.send(JSON.stringify(getState().session));
    dispatch(setSocket(socket));
  };

  const list = {};
  const dispatchList = setInterval(() => {
    if (list[noticeActions.create] && list[noticeActions.create].length) {
      dispatch(noticeActions.insertList(list[noticeActions.create]));
      list[noticeActions.create] = [];
    }
  }, timeBatchUp);
  // onmessage incoming message
  // Because prettier.... https://github.com/prettier/prettier/issues/3465
  /* eslint-disable implicit-arrow-linebreak */
  socket.onmessage = message =>
    setTimeout(() => {
      if (!message.data) {
        return;
      }
      const envelope = JSON.parse(message.data);
      wsLog.info('websocket', envelope);
      // close on terminate
      if (envelope.type === 'Session/TERMINATE') {
        dispatch(closeWebSocket());
      }

      // Incident update when an incident has changed.
      if (envelope.type.startsWith('Incident')) {
        dispatch(incidentActions.handleIncidentMessage(envelope.type, envelope.incident));
        return;
      }

      // Marker update when a marker has changed.
      if (envelope.type.startsWith('Marker')) {
        dispatch(markerActions.handleMarkerMessage(envelope.marker));
        return;
      }

      // Sit915 update when a narrative message has been sent
      if (envelope.type.startsWith('Sit915')) {
        dispatch(messageActions.handleSit915Message(envelope.sit915));
        return;
      }

      // action dispatch
      const { type, ...others } = envelope;
      const value = Object.values(others).filter(v => v);
      // if no envelope payload then empty object
      dispatch({ type, payload: value.length === 1 ? value[0] : {} });
      if (!list[envelope.type]) {
        list[envelope.type] = [];
      }
      // Batch notice updates to be inserted on a time interval
      list[envelope.type].push(envelope.notice);
    }, 0);

  socket.onerror = error => {
    clearTimeout(dispatchList);
    dispatch(socketError(error));
  };
};
/* eslint-enable implicit-arrow-linebreak */

const closeWebSocketThunk = () => (dispatch, getState) => {
  const socket = getState().session.socket;
  if (socket) {
    socket.close();
    dispatch(clearSocket());
  }
};

/** *************************************
 * Action Creators
 ************************************* */
export const updateUser = createAction(UPDATE_USER);
export const createSession = createSessionThunk;
export const getSession = getSessionThunk;
export const deleteSession = deleteSessionThunk;
const getSessionSuccess = createAction(READ_SESSION_SUCCESS);
const deleteSessionSuccess = createAction(TERMINATE_SESSION_SUCCESS);
const createSessionSuccess = createAction(CREATE_SESSION_SUCCESS);
const createSessionFailure = createAction(CREATE_SESSION_FAILURE, error => error);
const openWebSocket = openWebSocketThunk;
const closeWebSocket = closeWebSocketThunk;
const setSocket = createAction(SET_SOCKET);
const clearSocket = createAction(CLEAR_SOCKET);
const socketError = createAction(SOCKET_ERROR);
const connectionError = createAction(CONNECTION_FAILURE);
const connectionSuccess = createAction(CONNECTION_SUCCESS);

/** *************************************
 * Reducers
 ************************************* */
const initialState = {
  state: 'initial',
  permissions: [],
  permissionMap: {},
  user: null,
  attempts: 0,
  socket: null,
  socketError: null,
  connectionError: null,
};

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CREATE_SESSION_SUCCESS:
    case READ_SESSION_SUCCESS: {
      const session = action.payload;
      if (session && session.permissions) {
        session.permissionMap = {};
        session.permissions.forEach(permission => {
          session.permissionMap[permission.classId] = permission.classId;
          permission.actions.forEach(act => {
            session.permissionMap[permission.classId + act] = true;
          });
        });
      }
      return {
        ...state,
        ...session,
        connectionError: null,
        attempts: 0,
      };
    }
    case TERMINATE_SESSION: {
      const session = action.payload;
      delete state.session;
      return { ...state, ...session };
    }
    case IDLE_SESSION: {
      const session = action.payload;
      if (session && session.permissions) {
        session.permissionMap = {};
        session.permissions.forEach(permission => {
          session.permissionMap[permission.classId] = permission.classId;
          permission.actions.forEach(act => {
            session.permissionMap[permission.classId + act] = true;
          });
        });
      }
      if (isEquivalent(state.permissionMap, session.permissionMap)) {
        return state;
      }
      return { ...state, ...session };
    }
    case TERMINATE_SESSION_SUCCESS: {
      return initialState;
    }
    case CREATE_SESSION_FAILURE: {
      return { ...state, attempts: state.attempts + 1, state: 'initial' };
    }
    case SET_SOCKET: {
      return { ...state, socket: action.payload };
    }
    case CLEAR_SOCKET: {
      return { ...state, socket: null };
    }
    case SOCKET_ERROR: {
      return { ...state, socketError: action.payload };
    }
    case CONNECTION_FAILURE: {
      return { ...state, connectionError: action.payload };
    }
    case CONNECTION_SUCCESS: {
      return { ...state, connectionError: null };
    }
    case UPDATE_USER: {
      return {
        ...state,
        user: {
          ...action.payload,
        },
      };
    }
    default: {
      return state;
    }
  }
}

export const init = store => {
  store.addReducer('session', reducer);
};
