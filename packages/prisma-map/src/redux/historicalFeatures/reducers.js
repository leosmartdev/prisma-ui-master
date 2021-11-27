/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Reducers and Epics for handline history for a feature for the map.
 *
 */
import { handleActions } from 'redux-actions';
import {
  addHistoryFeature,
  clearAllHistoryFeatures,
} from './actions';

/* ************************************************
 * Reducer functions
 ************************************************ */

/**
 * Adds a new history feature to the state.
 *
 * @param {object} state Current redux state.
 * @param {object} action The redux action for ADD_FEATURE
 * @param {object} action.feature The feature object to add. Must have `id` property.
 * @return {object} new state with history object added
 */
export function addHistoryFeatureReducer(state, action) {
  const newFeature = action.payload.feature;

  if (!newFeature.id) {
    return state;
  }

  let { time = null } = newFeature.properties;
  if (time === null && newFeature.properties.target && newFeature.properties.target.time) {
    ({ time } = newFeature.properties.target);
  }

  if (time === null) {
    return state;
  }

  // TODO: map out how historical features look
  return {
    ...state,
    [newFeature.id]: {
      ...state[newFeature.id],
      [time]: { ...newFeature },
    },
  };
}

/**
 * Called when all history data is cleared.
 *
 * @return {object} New empty state object.
 */
export function clearAllHistoryFeaturesReducer() {
  return {};
}

/* ************************************************
 * Reducer creation
 ************************************************ */

const initialState = { };

const reducerMap = {
  [addHistoryFeature]: addHistoryFeatureReducer,
  [clearAllHistoryFeatures]: clearAllHistoryFeaturesReducer,
};
export default handleActions(reducerMap, initialState);
