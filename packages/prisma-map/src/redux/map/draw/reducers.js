/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Reducers for the draw mode of a given map. These reducers will be added to the
 * `redux/map/reducers`;
 */
import {
  changeDrawTool,
  addInputFeatureToDraw,
  setOutputFeatureFromDraw,
} from './actions';

/**
 * Changes the draw tool for the specified map to the provided tool.
 *
 * @param {object} state
 * @param {object} action changeDrawTool(mapId, tool) action
 */
export function changeDrawToolReducer(state, action) {
  const { mapId, tool } = action.payload;
  const map = state[mapId];

  if (!map) {
    return state;
  }

  return {
    ...state,
    [mapId]: {
      ...map,
      draw: {
        featureIn: null,
        featureOut: null,
        ...map.draw,
        tool,
      },
    },
  };
}

/**
 * Adds a single feature to the draw tool. Any existing features will be removed unless the ID's
 * match of the feature being added.
 *
 * isInput is a boolean, when true, we are setting the input feature, otherwise, set output feature.
 * input feature is the feature to pass INTO the draw tool, output feature is the result of the
 * draw tool.
 *
 * @param {object} state
 * @param {object} action addFeatureToDraw(mapId, feature, isInput) action
 */
export function addFeatureToDrawReducer(state, action) {
  const { mapId, feature, isInput } = action.payload;
  const map = state[mapId];

  if (!map) {
    return state;
  }

  const newDrawState = {
    ...map.draw,
    featureOut: { ...feature },
  };

  if (isInput && (!newDrawState.featureIn || feature.id !== newDrawState.featureIn)) {
    newDrawState.featureIn = feature;
  }

  return {
    ...state,
    [mapId]: {
      ...map,
      draw: {
        ...newDrawState,
      },
    },
  };
}

const reducers = {
  [changeDrawTool]: changeDrawToolReducer,
  [addInputFeatureToDraw]: addFeatureToDrawReducer,
  [setOutputFeatureFromDraw]: addFeatureToDrawReducer,
};

export default reducers;
