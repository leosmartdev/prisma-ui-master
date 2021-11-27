import { createAction, handleActions } from 'redux-actions';

import { configurationUpdated } from 'configuration';

// Action Types
const NEW = 'Notice/NEW';
const INSERT_LIST = 'Notice/Insert';
const ACKNOWLEDGE = 'Notice/ACK';
const CLEAR = 'Notice/CLEAR';
const ACKNOWLEDGE_WAIT = 'Notice/ACK_WAIT';
const CLEAR_ALL = 'Notice/CLEAR_ALL';
const NOTICE_SOUND_OFF = 'Notice/SOUND_OFF';
const NOTICE_SOUND_ON = 'Notice/SOUND_ON';

/** *************************************
 * Helpers
 ************************************* */

/**
 * Returns the notice with the ID set as the target or source in the provided list of notices.
 * Can find a target by target_id, registry_id, or database_id or a source by zone_id or incident_id
 *
 * @param {object|string} item The id or the target being searched for.
 * @param notices
 */
export function findNoticeById(item, notices) {
  let id = '';
  if (typeof item === 'string') {
    id = item;
  } else {
    id = item.targetId || item.registryId || item.databaseId;
  }

  const filtered = notices.filter(notice => {
    if (!notice.target && !notice.source) {
      return false;
    }

    const obj = notice.target || notice.source;

    if (
      obj.trackId === id ||
      obj.registryId === id ||
      obj.databaseId === id ||
      obj.zoneId === id ||
      obj.incidentId === id ||
      obj.incidentid === id
    ) {
      return true;
    }

    return false;
  });

  if (filtered.length !== 1) {
    return null;
  }
  return filtered[0];
}

/** *************************************
 * Thunks
 ************************************* */
const acknowledgeForTargetThunk = target => (dispatch, getState) => {
  const notices = getState().notifications.list;
  const notice = findNoticeById(target, notices);
  if (notice !== null) {
    return dispatch(acknowledge(notice));
  }

  return Promise.reject({
    error: {
      statusText: `Notice for target ${target} not found. Could not acknowledge.`,
    },
  });
};

const acknowledgeThunk = notice => (dispatch, getState) => {
  const server = getState().server;

  return new Promise((resolve, reject) => {
    server.post(`/notice/${notice.databaseId}/ack`, {}).then(
      json => {
        dispatch(clear({databaseId: json.ID || '' }));
        resolve(json);
      },
      err => {
        reject(err);
      },
    );
  });
};

const acknowledgeAllThunk = () => (dispatch, getState) => {
  const server = getState().server;

  return new Promise((resolve, reject) => {
    server.post('/notice/all/ack').then(
      json => {
        dispatch(clearAll());
        resolve(json);
      },
      err => {
        reject(err);
      }
    );
  });
};

/** *************************************
 * Action Creators
 ************************************* */
export const create = createAction(NEW, notice => notice);
export const insertList = createAction(INSERT_LIST, list => list);
export const acknowledgeResponse = createAction(ACKNOWLEDGE, notice => notice);
export const acknowledgeWait = createAction(ACKNOWLEDGE_WAIT, notice => notice);
export const acknowledgeForTarget = acknowledgeForTargetThunk;
export const clear = createAction(CLEAR, notice => notice);
export const clearAll = createAction(CLEAR_ALL);
export const acknowledge = acknowledgeThunk;
export const acknowledgeAll = acknowledgeAllThunk;
// Notice Sound
export const turnNoticeSoundOff = createAction(NOTICE_SOUND_OFF);
export const turnNoticeSoundOn = createAction(NOTICE_SOUND_ON);

/** *************************************
 * Reducers
 ************************************* */

const defaultState = {
  list: [],
  highPriorityNotices: [],
  latest: null,
  soundOff: false,
};

const upsertToList = (state, notice) => {
  const list = state.slice();
  const i = list.findIndex(e => e.databaseId == notice.databaseId);
  if (i < 0) {
    list.unshift(notice);
  } else {
    list[i] = notice;
  }
  return list;
};

const upsertToPriorityList = (state, notice) => {
  const list = state.slice();
  if (notice.priority === 'Alert') {
    const i = list.findIndex(e => e.databaseId == notice.databaseId);
    if (i < 0) {
      list.unshift(notice);
    } else {
      list[i] = notice;
    }
  }

  return list;
};

const removeFromList = (state, notice) => {
  const list = state.slice();
  const i = list.findIndex(e => e.databaseId == notice.databaseId);
  if (i >= 0) {
    list.splice(i, 1);
  }
  return list;
};

const upsertBatchToList = (state, notices) => {
  const list = state.slice();
  if (!Array.isArray(notices)) {
    return list;
  }
  for (const notice of notices) {
    const i = list.findIndex(e => e.databaseId === notice.databaseId);
    if (i < 0) {
      list.unshift(notice);
    } else {
      list[i] = notice;
    }
  }
  return list;
};

const upsertBatchToPriorityList = (state, notices) => {
  const list = state.slice();
  if (!Array.isArray(notices)) {
    return list;
  }
  for (const notice of notices) {
    if (notice.priority === 'Alert') {
      const i = list.findIndex(e => e.databaseId == notice.databaseId);
      if (i < 0) {
        list.unshift(notice);
      } else {
        list[i] = notice;
      }
    }
  }

  return list;
};

export const reducer = handleActions(
  {
    [configurationUpdated]: (state, action) => ({
      ...state,
      soundOff: action.payload.client.disableNotificationSound || state.soundOff,
    }),
    [NEW]: (state, action) => ({
      ...state,
      latest: action.payload,
    }),
    [INSERT_LIST]: (state, action) => ({
      ...state,
      list: upsertBatchToList(state.list, action.payload),
      highPriorityNotices: upsertBatchToPriorityList(state.highPriorityNotices, action.payload),
    }),
    [ACKNOWLEDGE_WAIT]: (state, action) => ({
      ...state,
      list: upsertToList(state.list, action.payload),
      highPriorityNotices: upsertToPriorityList(state.highPriorityNotices, action.payload),
      latest: action.payload,
    }),
    [CLEAR]: (state, action) => ({
      ...state,
      list: removeFromList(state.list, action.payload),
      highPriorityNotices: removeFromList(state.highPriorityNotices, action.payload),
      latest: action.payload,
    }),
    [ACKNOWLEDGE]: (state, action) => ({
      ...state,
      list: removeFromList(state.list, action.payload),
      highPriorityNotices: removeFromList(state.highPriorityNotices, action.payload),
      latest: action.payload,
    }),
    [CLEAR_ALL]: state => ({
      ...state,
      list: [],
      highPriorityNotices: [],
    }),
    [NOTICE_SOUND_OFF]: state => ({
      ...state,
      soundOff: true,
    }),
    [NOTICE_SOUND_ON]: state => ({
      ...state,
      soundOff: false,
    }),
  },
  defaultState,
);

export const init = store => {
  store.addReducer('notifications', reducer);
};
