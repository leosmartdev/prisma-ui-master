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
import {
  START_DRAW_MODE,
  STOP_DRAW_MODE,
} from './types';
import { setMapMode } from '../actions';
import { changeDrawTool } from './actions';

export const startDrawModeEpic = action$ => action$.pipe(
  ofType(START_DRAW_MODE),
  flatMap(action => [
    setMapMode(action.payload.mapId, 'draw'),
    changeDrawTool(action.payload.mapId, 'select'),
  ]),
);

export const stopDrawModeEpic = action$ => action$.pipe(
  ofType(STOP_DRAW_MODE),
  flatMap(action => [
    setMapMode(action.payload.mapId, 'normal'),
  ]),
);

export default [
  startDrawModeEpic,
  stopDrawModeEpic,
];
