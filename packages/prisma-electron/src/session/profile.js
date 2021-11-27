import { createAction, handleActions } from 'redux-actions';

import * as transactionsActions from 'server/transaction';
import * as sessionActions from 'session/session';

// Action Types
const SAVE_PROFILE = 'profile/save';

/** *************************************
 * Thunks
 ************************************* */
const saveProfileThunk = (transactionId, userId, userProfile) => (dispatch, getState) => {
  const profile = userProfile;
  if (profile.password !== profile.verifyPassword) {
    dispatch(
      transactionsActions.transactionFailure(transactionId, {
        data: [
          {
            property: 'password',
            rule: 'MustMatch',
            message: 'Passwords must match.',
          },
          {
            property: 'verifyPassword',
            rule: 'MustMatch',
            message: 'Passwords must match.',
          },
        ],
      }),
    );
    return;
  }
  const server = getState().server;
  server.put(`/auth/profile/${userId}`, profile, {}).then(
    response => {
      dispatch(transactionsActions.transactionSuccess(transactionId, response));
      dispatch(sessionActions.updateUser(response));
    },
    error => {
      dispatch(transactionsActions.transactionFailure(transactionId, error));
    },
  );
};

/** *************************************
 * Action Creators
 ************************************* */
export const saveProfile = saveProfileThunk;
export const saveProfileSuccess = createAction(`${SAVE_PROFILE}:success`);

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {};

// Map of Action Types to the reducer functions that will handle that type.
const reducerMap = {
  [saveProfileSuccess]: state => ({
    ...state,
  }),
};

export const reducer = handleActions(reducerMap, defaultState);

export const init = store => {
  store.addReducer('profile', reducer);
};
