/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 */
import { createAction } from 'redux-actions';

import {
  STOP_DRAW_MODE,
  START_DRAW_MODE,
  CHANGE_DRAW_TOOL,
  ADD_DRAW_FEATURE,
  DRAW_FEATURE_CREATED,
  DRAW_FEATURE_UPDATED,
  DRAW_FEATURE_REMOVED,
} from './types';

/**
 * Starts draw mode.
 * @param {string} mapId
 */
export const startDrawMode = createAction(START_DRAW_MODE, mapId => ({ mapId }));

/**
 * Stops draw mode and sets the map mode back to normal.
 * @param {string} mapId
 */
export const stopDrawMode = createAction(STOP_DRAW_MODE, mapId => ({ mapId }));

/**
 * Changes the current draw tool to the provided tool.
 * @param {string} tool One of 'select', 'point', 'polygon', 'line'
 */
export const changeDrawTool = createAction(CHANGE_DRAW_TOOL, (mapId, tool) => ({ mapId, tool }));

/**
 * Adds a feature to the draw mode. This will erase any existing features and set the only feature
 * in the draw as what's provided.
 */
export const addInputFeatureToDraw = createAction(
  ADD_DRAW_FEATURE,
  (mapId, feature) => ({ mapId, feature, isInput: true }),
);

/**
 * Captures the output feature from draw mode. This is the feature when the user completes editing
 * or updating a feature.
 */
export const setOutputFeatureFromDraw = createAction(
  ADD_DRAW_FEATURE,
  (mapId, feature) => ({ mapId, feature, isInput: false }),
);

export const drawFeatureCreated = createAction(DRAW_FEATURE_CREATED, feature => ({ feature }));
export const drawFeatureUpdated = createAction(DRAW_FEATURE_UPDATED, feature => ({ feature }));
export const drawFeatureRemoved = createAction(DRAW_FEATURE_REMOVED, feature => ({ feature }));

