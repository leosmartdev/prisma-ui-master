/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import { createAction } from 'redux-actions';

import {
  ADD_FEATURE,
  REMOVE_FEATURE,
  UPSERT_FEATURE,
  TIMEOUT_FEATURE,
  LEFT_GEO_RANGE,
} from './types';

/**
 * Dispatch this action to add or update a feature. This will cause map styles to be requested to
 * re-render their styles with the new updates.
 *
 * @param {GeoJSON Feature} feature The feature to add.
 */
export const addFeature = createAction(ADD_FEATURE, feature => ({ feature }));

/**
 * Dispatch this action when a feature has timed out and should be removed. This will cause map
 * styles to be requested to re-render their styles with the new updates.
 *
 * @param {GeoJSON Feature} feature The feature that has timed out.
 */
export const timeoutFeature = createAction(TIMEOUT_FEATURE, feature => ({ feature }));

/**
 * Dispatch this action when a feature has left the bounds of a map and should be removed. This will
 * cause map styles to be requested to re-render their styles with the new updates.
 *
 * TODO: This should only call removeFeature when it's no longer in the bounds of ANY map. The
 * backend should really let us know when it supports multiple viewports when its just left a map
 * and when it's left ALL maps.
 *
 * @param {GeoJSON Feature} feature The feature that has timed out.
 */
export const featureLeftGeoRange = createAction(LEFT_GEO_RANGE, feature => ({ feature }));


/*
 * Internal Actions
 */

/**
 * Dispatched by epics to upsert a feature in the store.
 */
export const upsertFeature = createAction(UPSERT_FEATURE, feature => ({ feature }));
/**
 * Dispatched by epics to remove a feature from the store.
 */
export const removeFeature = createAction(REMOVE_FEATURE, feature => ({ feature }));
