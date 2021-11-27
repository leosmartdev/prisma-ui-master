/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 *
 * Actions for a specific map instance.
 */

import { createAction } from 'redux-actions';
import {
  CREATE_MAP,
  SET_MAP_STYLE,
  SET_GENERATED_MAP_STYLE,
  SET_LAYER_VISIBILITY,
  SET_LAYER_VISIBILE,
  SET_LAYER_HIDDEN,
  MAP_LOADED,
  SET_MAP_LOADED,
  MAP_WILL_UNLOAD,
  REQUEST_UPDATE_MAP_STYLE,
  FLY_TO,
  SET_MAP_MODE,
} from './types';

/**
 * Creates a map using the config object. This sets up the initial style object, toggleable layers
 * from the config, and creates a generated style equal to the provided config.style. When the map
 * loads the config will be generated from the received map style and features will then be added.
 * Setting the genrated style here just allows for the map to load initially and after map load
 * it should only be set by `createStylesForAllMaps`.
 *
 * Ideally, this is done at application start time, and when the `<Map>` component gets mounted
 * it recieves this initial style. Then when the map loads, the style is then set to the fully
 * loaded style returned from the map and then we generate from that style a style with all the
 * layers and features. Everytime features get updated a new style is generated and sent to the map.
 * This happens until the map is unloaded, then we stop updating that maps style.
 *
 * Config example:
 * ```
 * config = {
 *   id: 'map1', // required
 *   style: 'mapbox://url.to.map', // can also be the style object itself.
 *   toggleableLayers: ['ais', 'omnicom', 'radar'],  // optional list of layers
 * }
 * ```
 *
 * @param {object} config the map configuration, that at a minimum contains id and style. Can also
 *                        contain list of layer ids that are toggleable (visible/hidden) on the
 *                        property `toggleableLayers`
 */
export const createMap = createAction(CREATE_MAP, config => ({ config }));

/**
 * Action for informing the system that a map has loaded. Expects mapId of the map and the style as
 * returned from the map. This is so when we use url based initial styles we can get the real style
 * object the map is working with after loading it from the servers.
 *
 * @param {string} mapId The ID of the map that has loaded.
 * @param {object} style The style object the map loaded.
 */
export const mapLoaded = createAction(MAP_LOADED, (mapId, style) => ({ mapId, style }));

/**
 * Action to set the map as loaded in the store. This will update the map state and set
 * loaded = true. Required since mapLoaded() is handled in the epic and epics can't create an action
 * of the same type that it handles.
 *
 * @param {string} mapId The ID of the map that is to be set as loaded.
 */
export const setMapLoaded = createAction(SET_MAP_LOADED, mapId => ({ mapId }));

/**
 * Action for informing the system that a map has unloaded. Expects mapId of the map.
 *
 * @param {string} mapId The ID of the map that has loaded.
 */
export const mapWillUnload = createAction(MAP_WILL_UNLOAD, mapId => ({ mapId }));

/**
 * Sets the map style to the new style passed in. This is a replacment action, so existing style
 * will be erased with the new style. This is the base style that style generation will use when
 * filtering dynamic features onto layers.
 *
 * @param {string} mapId The ID of the map to set the style of.
 * @param {object} style The mapboxgl style object that contains the base or full style object.
 */
export const setMapStyle = createAction(SET_MAP_STYLE, (mapId, style) => ({ mapId, style }));

/**
 * Sets the generated map style to the new style passed in. This is a replacment action, so existing
 * style will be erased with the new style. This is the style to be passed into the map.
 *
 * @param {string} mapId The ID of the map to set the style of.
 * @param {object} style The mapbox-gl based style object that contains the full style object.
 */
export const setGeneratedMapStyle = createAction(
  SET_GENERATED_MAP_STYLE,
  (mapId, style) => ({ mapId, style }),
);

/**
 * Requests that a map style is generated. This can be because the style has changed or features
 * have been added. After a period of time defined in the mapStyleUpdateEpic, a new style
 * will be generated and pushed into the state to be sent to the maps.
 *
 * @param {string} mapId The ID of the map to generate a new style for.
 */
export const requestMapStyleUpdate = createAction(REQUEST_UPDATE_MAP_STYLE, mapId => ({ mapId }));

/**
 * Sets a map layer as visible.
 *
 * @param {string} mapId The ID of the map to set the style of.
 * @param {string} layerId The ID of the layer being set to visible.
 */
export const setLayerVisible = createAction(
  SET_LAYER_VISIBILE,
  (mapId, layerId) => ({ mapId, layerId }),
);

/**
 * Sets a map layer as hidden.
 *
 * @param {string} mapId The ID of the map to set the style of.
 * @param {string} layerId The ID of the layer being set to hidden.
 */
export const setLayerHidden = createAction(
  SET_LAYER_HIDDEN,
  (mapId, layerId) => ({ mapId, layerId }),
);

/**
 * Sets a map layer visibility, hidden or visible.
 *
 * @param {string} mapId The ID of the map to set the style of.
 * @param {string} layerId The ID of the layer being set.
 * @param {boolean} isVisible true for visible, false for hidden
 */
export const setLayerVisibility = createAction(
  SET_LAYER_VISIBILITY,
  (mapId, layerId, isVisible) => ({ mapId, layerId, isVisible }),
);

/**
 * Moves the map to the provided location using a flyTo animation.
 * @param {string} mapId The ID of the map to set the style of.
 * @param {object} center
 * @param {float} center.latitude
 * @param {float} center.longitude
 */
export const flyTo = createAction(FLY_TO, (mapId, center) => ({ mapId, center }));

/**
 * Sets the map mode.
 * @param {string} mapId
 * @param {string} mode 'normal' or 'draw'
 */
export const setMapMode = createAction(SET_MAP_MODE, (mapId, mode) => ({ mapId, mode }));
