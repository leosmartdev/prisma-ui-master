import { createAction, handleActions } from 'redux-actions';

import { upsert } from 'lib/list';

// Action Types
const GET_FEATURE_SUCCESS = 'map/features/get:success';

/** *************************************
 * Thunks
 ************************************* */
const thunks = {
  getFeature: (id, type) => (dispatch, getState) => {
    const server = getState().server;

    const promise = server.get(`/${type}/${id}`);
    promise.then(response => {
      dispatch(getFeatureSuccess(response));
    });

    return promise;
  },
};

/** *************************************
 * Action Creators
 ************************************* */
export const getFeature = thunks.getFeature;
export const getFeatureSuccess = createAction(GET_FEATURE_SUCCESS, feature => feature);

/** *************************************
 * Reducers
 ************************************* */
// Initial State
const defaultState = {
  features: [],
};

// Map of Action Types to the reducer functions that will handle that type.
const reducerMap = {
  [getFeatureSuccess]: (state, action) => ({
    ...state,
    features: upsert(state.features, action.payload),
  }),
};

export const reducer = handleActions(reducerMap, defaultState);

export const init = store => {
  store.addReducer('map_feature', reducer);
};
