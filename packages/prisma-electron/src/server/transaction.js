import uuid from 'uuid/v4';
import { createAction, handleActions } from 'redux-actions';

import { withTransactionConnected } from './withTransaction';

// Helpers
export const generateTransactionId = () => uuid();

/** *************************************
 * HOC
 ************************************* */
const withTransaction = withTransactionConnected;
export { withTransaction };

// Action Types
const CREATE_TRANSACTION = 'transaction/create';
const DELETE_TRANSACTION = 'transaction/delete';
const TRANSACTION_SUCCESS = 'transaction/success';
const TRANSACTION_FAILURE = 'transaction/failed';

/** *************************************
 * Thunks
 ************************************* */
const createTransactionThunk = (transactionId, action) => dispatch => {
  dispatch(createTransactionSuccess(transactionId));
  if (action) {
    return dispatch(action);
  }
};

/** *************************************
 * Action Creators
 ************************************* */
export const createTransaction = createTransactionThunk;
export const createTransactionSuccess = createAction(
  CREATE_TRANSACTION,
  (transactionId, action) => ({ transactionId, action }),
);
export const deleteTransaction = createAction(DELETE_TRANSACTION, transactionId => transactionId);
export const transactionSuccess = createAction(TRANSACTION_SUCCESS, (transactionId, response) => ({
  transactionId,
  response,
}));
export const transactionFailure = createAction(TRANSACTION_FAILURE, (transactionId, error) => ({
  transactionId,
  error,
}));

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {};

// Map of Action Types to the reducer functions that will handle that type.
const reducerMap = {
  [createTransaction]: (state, action) => ({
    ...state,
    [action.payload]: {
      loading: true,
    },
  }),
  [deleteTransaction]: (state, action) => {
    const newState = { ...state };
    if (newState[action.payload]) {
      delete newState[action.payload];
    }
    return newState;
  },
  [transactionSuccess]: (state, action) => ({
    ...state,
    [action.payload.transactionId]: {
      loading: false,
      response: action.payload.response,
    },
  }),
  [transactionFailure]: (state, action) => ({
    ...state,
    [action.payload.transactionId]: {
      loading: false,
      error: action.payload.error,
    },
  }),
};

export const reducer = handleActions(reducerMap, defaultState);

export const init = store => {
  store.addReducer('transactions', reducer);
};
