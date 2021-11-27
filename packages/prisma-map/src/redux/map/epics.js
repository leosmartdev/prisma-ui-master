/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import {
  map,
  auditTime,
  withLatestFrom,
  flatMap,
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import {
  MAP_LOADED,
  REQUEST_UPDATE_MAP_STYLE,
  SET_LAYER_HIDDEN,
  SET_LAYER_VISIBILE,
} from './types';
import {
  setMapStyle,
  setGeneratedMapStyle,
  setMapLoaded,
  requestMapStyleUpdate,
  setLayerVisibility,
} from './actions';
import { createStylesForAllMaps } from './selectors';
import drawEpics from './draw/epics';

/**
 * Handles Map/Loaded redux event sets up the map style, layers, etc...
 * @param {stream} action$
 */
export const mapLoadedEpic = action$ => action$.pipe(
  ofType(MAP_LOADED),
  flatMap(action => [
    setMapStyle(action.payload.mapId, action.payload.style),
    setMapLoaded(action.payload.mapId),
    requestMapStyleUpdate(action.payload.mapId),
  ]),
);

/**
 * Handles the throttling of updating the map styles. Here, we batch together requests for maps
 * to be updated, then on an interval generate the new style for the maps then apply those styles.
 * This way, we arent constantly re-creating styles multiple times a second.
 *
 * Current interval is 700ms, but this can be changed as needed after testing in a real environment.
 * Assumption is, the map really only *needs* to be updated once per second, or at most, twice a
 * second. If we need to allow smoother maps in the future, we can by doing animations between
 * updates.
 */
export const updateStyleEpic = (action$, state$) => action$.pipe(
  // Map is requested to update.
  ofType(REQUEST_UPDATE_MAP_STYLE),

  // Wait a period of time, any other requests to update will be ignore.
  auditTime(700),

  // Grabs the current state so we can get a list of map ids.
  withLatestFrom(state$),

  // Create a new generated style for each map. This essentially filters all the features onto the
  // layers they will be displayed on and returns a style object ready to be sent to `<Map>`.
  // eslint-disable-next-line no-unused-vars
  flatMap(([action, state]) => Object.entries(createStylesForAllMaps(state))),

  // Update the style for each of the map ids
  map(([mapId, style]) => setGeneratedMapStyle(mapId, style)),

  // TODO make this dispatch an error.
  // catchError(error => { console.error(error); return error; }),
);

/**
 * When setting layer visibility, this epic ensures the maps are updated with the new style to
 * actually apply the visibility change.
 * @param {stream} action$
 * @return {stream}
 */
export const setLayerVisibilityEpic = action$ => action$.pipe(
  ofType(SET_LAYER_VISIBILE, SET_LAYER_HIDDEN),
  flatMap(action => [
    setLayerVisibility(
      action.payload.mapId,
      action.payload.layerId,
      action.type === SET_LAYER_VISIBILE, // set isVisible to true or false;
    ),
    requestMapStyleUpdate(action.payload.mapId),
  ]),
);

export default [
  mapLoadedEpic,
  updateStyleEpic,
  setLayerVisibilityEpic,
  ...drawEpics,
];
