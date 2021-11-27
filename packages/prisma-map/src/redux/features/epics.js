/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import { flatMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { ADD_FEATURE, TIMEOUT_FEATURE, LEFT_GEO_RANGE } from './types';
import { upsertFeature, removeFeature } from './actions';
import { requestMapStyleUpdate } from '../map/actions';

/**
 * Handles a feature add. This will upsert the feature into the store (works for add and update
 * operations) and then dispatches a redux action to request the maps be updated with the new
 * feature.
 */
export const addFeatureEpic = action$ => action$.pipe(
  ofType(ADD_FEATURE),
  flatMap(action => [
    upsertFeature(action.payload.feature),
    requestMapStyleUpdate(),
  ]),
);

/**
 * Handles feature remove actions. Timeouts and leaving the geo range triggers removeFeature
 * and then dispatches a redux action to request the maps be updated with the new feature.
 */
export const removeFeatureEpic = action$ => action$.pipe(
  ofType(LEFT_GEO_RANGE, TIMEOUT_FEATURE),
  flatMap(action => [
    removeFeature(action.payload.feature),
    requestMapStyleUpdate(),
  ]),
);

export default [addFeatureEpic, removeFeatureEpic];
