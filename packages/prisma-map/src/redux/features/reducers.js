/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Reducers and Epics for handline features for the map.
 *
 */
import { handleActions } from 'redux-actions';
import {
  upsertFeature,
  removeFeature,
} from './actions';

/* ************************************************
 * Reducer functions
 ************************************************ */

/**
 * Adds a new feature to the state, or if the feature already exists, it will override the existing
 * feature in the state.
 *
 * @param {object} state Current redux state.
 * @param {object} action The redux action for ADD_FEATURE
 * @param {object} action.feature The feature object to add. Must have `id` property.
 */
export function upsertFeatureReducer(state, action) {
  const newFeature = action.payload.feature;

  if (!newFeature.id) {
    return state;
  }

  return {
    ...state,
    [newFeature.id]: newFeature,
  };
}

/**
 * Called when a feature is to be removed, either from leaving geo range or from timing out.
 *
 * @param {object} state Current redux state.
 * @param {object} action The redux action
 * @param {object} action.feature The feature object to remove. Must have `id` property.
 */
export function removeFeatureReducer(state, action) {
  const newState = { ...state };
  delete newState[action.payload.feature.id];

  return newState;
}

/* ************************************************
 * Reducer creation
 ************************************************ */

const initialState = {};

const reducerMap = {
  [upsertFeature]: upsertFeatureReducer,
  [removeFeature]: removeFeatureReducer,
};
export default handleActions(reducerMap, initialState);
