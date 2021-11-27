import { createAction, handleActions } from 'redux-actions';
import loglevel from 'loglevel';

const log = loglevel.getLogger('message');

export const handleSit915Message = sit915 => dispatch => {
  dispatch(updateStatus(sit915));
}

/** *************************************
 * Action Types
 ************************************* */
const LIST_MESSAGES = 'message/list';
const SET_CURRENT_MESSAGE = 'message/set-current-message';
const UPDATE_STATUS = 'message/update-status';
const ACK_MESSAGE = 'message/acknowledge';

/** *************************************
 * Thunks
 ************************************* */
function createSit915MessageThunk(config) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.post(`/sit915/${config.comm_link_type}/${config.remotesite_id}`, config).then(
        json => {
          log.info('Created a new SIT 915 message', json);
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
}

function listMessagesThunk(sitNumber, direction, startDateTime, endDateTime) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      let params = {
        'sit-number': sitNumber,
        'direction': direction,
        'start-datetime': startDateTime,
        'end-datetime': endDateTime,
      };

      server.get('/message', params).then(
        json => {
          log.info('Got all SIT 185 & 915 messages', json);
          dispatch(listMessagesSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
};

function retryMessageThunk(id) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put(`/sit915/retry/${id}`).then(
        json => {
          dispatch(updateStatus(json));
          resolve(json);
        },
        error => {
          reject(error);
        },
      );
    });
  };
}

function acknowledgeMessageThunk(id) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.put(`/sit915/ack/${id}`).then(
        json => {
          dispatch(acknowledgeMessageSuccess(json));
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
export const createSit915Message = createSit915MessageThunk;

export const listMessages = listMessagesThunk;
export const listMessagesSuccess = createAction(`${LIST_MESSAGES}`);

export const setCurrentMessage = createAction(`${SET_CURRENT_MESSAGE}`);

export const updateStatus = createAction(`${UPDATE_STATUS}`);

export const retryMessage = retryMessageThunk;

export const acknowledgeMessage = acknowledgeMessageThunk;
export const acknowledgeMessageSuccess = createAction(`${ACK_MESSAGE}`);

/** *************************************
 * Reducers
 ************************************* */
const initialState = {
  // List of all the SIT 185 & 915 messages
  messages: [],
  // Displaying message
  currentMessage: null,
  // Count of failed messages
  failedCount: 0,
};

const actionMap = {
  /** List SIT 185 & 915 messages */
  [listMessagesSuccess]: (state, action) => {
    const failedCount = action.payload.filter(elem => {
      return elem.Direction == 4 && elem.Dismiss == false;
    }).length;

    return {
      ...state,
      messages: action.payload,
      failedCount,
    };
  },
  /** Set currentMessage to display the details */
  [setCurrentMessage]: (state, action) => ({
    ...state,
    currentMessage: action.payload,
  }),
  /** Update message status */
  [updateStatus]: (state, action) => {
    let payload = action.payload;
    let messages = state.messages;
    let failedCount = state.failedCount;
    let currentMessage = { ...state.currentMessage };

    let idx = messages.findIndex(elem => {
      return elem.id = payload.id;
    });

    let buffMsg = { ...messages[idx] };

    switch (payload.status) {
      case 'SENT':
        if (buffMsg.Direction == 4 && buffMsg.Dismiss == false) {
          failedCount--;
        }

        buffMsg.Direction = 1;
        break;
      case 'PENDING':
        if (buffMsg.Direction == 4 && buffMsg.Dismiss == false) {
          failedCount--;
        }

        buffMsg.Direction = 3;
        break;
      case 'FAILED':
        if (buffMsg.Direction == 1 || buffMsg.Direction == 3) {
          failedCount++;
        }

        buffMsg.Direction = 4;

        buffMsg.ErrorDetail = payload.errorDetail ? payload.errorDetail : payload.ErrorDetail;

        break;
    }
    buffMsg.CommLinkType = payload.commLinkType ? payload.commLinkType : payload.comm_link_type;
    buffMsg.Dismiss = payload.dismiss ? true : false;

    if (payload.message_body) {
      buffMsg.MessageBody = payload.message_body;
    }

    let buffMessages = [...messages];

    buffMessages.splice(idx, 1, buffMsg);

    if (currentMessage && currentMessage.Id == buffMsg.Id) {
      currentMessage = buffMsg;
    }

    return {
      ...state,
      messages: buffMessages,
      currentMessage,
      failedCount,
    };
  },
  /** Acknowledge failed message */
  [acknowledgeMessageSuccess]: (state, action) => {
    let payload = action.payload;
    let messages = state.messages;
    let failedCount = state.failedCount;
    let currentMessage = { ...state.currentMessage };

    let idx = messages.findIndex(elem => {
      return elem.id = payload.id;
    });

    let buffMsg = { ...messages[idx] };

    if (payload.dismiss) {
      buffMsg.Dismiss = true;
      failedCount--;
    }
    buffMsg.CommLinkType = payload.comm_link_type;

    let buffMessages = [...messages];

    buffMessages.splice(idx, 1, buffMsg);

    if (currentMessage && currentMessage.Id == buffMsg.Id) {
      currentMessage = buffMsg;
    }

    return {
      ...state,
      messages: buffMessages,
      failedCount,
      currentMessage,
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
  store.addReducer('message', reducer);
};