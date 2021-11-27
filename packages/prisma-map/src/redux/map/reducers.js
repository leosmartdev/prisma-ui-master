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
 * Reducers for handling map specific actions like creating a map, setting the style of a map,
 * adjusting visibility of a map layer, etc...
 */
import { handleActions } from 'redux-actions';
import {
  createMap,
  setMapLoaded,
  mapWillUnload,
  setMapStyle,
  setGeneratedMapStyle,
  setLayerVisibility,
  flyTo,
  setMapMode,
} from './actions';
import drawReducers from './draw/reducers';

/**
 * Creates a map using the config object. This sets up the initial style object, toggleable layers
 * from the config, and creates a generated style equal to the provided config.style. When the map
 * loads the config will be generated from the received map style and features will then be added.
 * Setting the genrated style here just allows for the map to load initially and after map load
 * it should only be set by `createStylesForAllMaps`.
 *
 * If the map already exists, this will return existing state and not make any modifications.
 */
export function createMapReducer(state, action) {
  const { config } = action.payload;
  const mapId = config.id;

  if (!mapId || state[mapId]) {
    return state;
  }

  return {
    ...state,
    mapIds: [...state.mapIds, mapId],
    [mapId]: {
      ...config,
      loaded: false,
      mode: 'normal',
      flyTo: null,
      generatedStyle: config.defaultStyle || null,
      layers: {
        dynamicLayers: [],
        toggleableLayers: [],
        ...config.layers,
      },
    },
  };
}

/**
 * Called when the map is loaded. This set the `loaded` flag on the map object in the state so that
 * the map is enabled for style generation when features are updated.
 */
export function setMapLoadedReducer(state, action) {
  const { mapId } = action.payload;

  if (!state[mapId]) {
    // eslint-disable-next-line
    console.warn('Attempting to load a map that has not been created. Please dispatch createMap() first before loading the Map');
    return state;
  }

  return {
    ...state,
    [mapId]: {
      ...state[mapId],
      loaded: true,
    },
  };
}

/**
 * Called when the map is unloaded. This set the `loaded` flag on the map object in the state so
 * that the map is disabled for style generation when features are updated.
 */
export function setMapUnloadedReducer(state, action) {
  const { mapId } = action.payload;

  if (!state[mapId]) {
    // eslint-disable-next-line
    console.warn('Attempting to unload a map that has not been created. Please dispatch createMap() first before additional actions on the Map');
    return state;
  }

  return {
    ...state,
    [mapId]: {
      ...state[mapId],
      loaded: false,
    },
  };
}

/**
 * Sets the base map style object. For generated styles that are sent to the map, see
 * `setGeneratedMapStyleReducer`. If mapId is not already created, this reducer will do nothing and
 * return the existing state.
 */
export function setMapStyleReducer(state, action) {
  const {
    mapId,
    style,
  } = action.payload;

  if (!state[mapId]) {
    return state;
  }

  return {
    ...state,
    [mapId]: {
      ...state[mapId],
      style: {
        mapId,
        ...style,
      },
    },
  };
}

/**
 * Sets the generated map style object. This is the base map style with features filtered and added
 * to the layers that will be displaying them on `style.sources`.
 * If mapId is not already created, this reducer will do nothing and
 * return the existing state.
 */
export function setGeneratedMapStyleReducer(state, action) {
  const {
    mapId,
    style,
  } = action.payload;

  if (!state[mapId]) {
    return state;
  }

  return {
    ...state,
    [mapId]: {
      ...state[mapId],
      generatedStyle: {
        mapId,
        ...style,
      },
    },
  };
}

/**
 * Sets the visibility of the provided layer.
 * @param {object} state Redux state.
 * @param {object} action Redux action
 * @param {string} action.payload.mapId The id of the map to change.
 * @param {string} action.payload.layerId The id of the layer on the map to change.
 * @param {boolean} action.payload.isVisible new value for visibility, true (visible) or false
 * (hidden)
 *
 * @return {object} new redux state with the layer updated.
 */
export function setLayerVisibilityReducer(state, action) {
  const { mapId, layerId, isVisible } = action.payload;
  const map = state[mapId];

  if (!map) {
    return state;
  }

  // If the layer exists OR the layer is listed in dynamic layers but not on this map, then
  // modify the state returning the layer with layout set on this map.
  // This way, layers that are defined globally but not on a per map basis can still have their
  // visibility set.
  if (map.layers[layerId]
    || (map.layers.dynamicLayers && map.layers.dynamicLayers.includes(layerId))
  ) {
    const layer = map.layers[layerId] || { id: layerId, layout: {} };
    return {
      ...state,
      [mapId]: {
        ...map,
        layers: {
          ...map.layers,
          [layerId]: {
            ...layer,
            layout: {
              ...layer.layout,
              visibility: isVisible ? 'visible' : 'none',
            },
          },
        },
      },
    };
  }

  // If the layer is not on map.layers or top level layers, then set visibility directly in the
  // map style, because this is not a prisma controlled layer that will be generated and placed
  // on the style
  let foundLayer = false;
  const layers = map.style ? map.style.layers : [];
  const newLayers = layers.map((layer) => {
    if (layer.id === layerId) {
      foundLayer = true;
      return {
        ...layer,
        layout: {
          ...layer.layout,
          visibility: isVisible ? 'visible' : 'none',
        },
      };
    }

    return layer;
  });

  if (foundLayer) {
    return {
      ...state,
      [mapId]: {
        ...map,
        style: {
          ...map.style,
          layers: newLayers,
        },
      },
    };
  }

  return state;
}

/**
 * Moves the map to the provided center point in a flyto motion.
 * @param {object} state Redux state.
 * @param {object} action Redux action
 * @param {string} action.payload.mapId The id of the map to change.
 * @param {object} action.payload.center
 * @param {float} action.payload.center.latitude
 * @param {float} action.payload.center.longitude
 */
export function flyToReducer(state, action) {
  const {
    mapId,
    center,
  } = action.payload;

  if (!state[mapId] || !center.longitude || !center.latitude) {
    return state;
  }

  const {
    latitude,
    longitude,
  } = center;

  if (latitude < -90 || latitude > 90
    || longitude < -180 || longitude > 180) {
    return state;
  }

  return {
    ...state,
    [mapId]: {
      ...state[mapId],
      flyTo: {
        latitude,
        longitude,
      },
    },
  };
}

/**
 * Set the map mode for a map.
 * @param {object} state Redux state.
 * @param {object} action Redux action
 * @param {string} action.payload.mapId The id of the map to change.
 * @param {string} action.payload.mode 'draw' or 'normal'
 */
export function setMapModeReducer(state, action) {
  const { mapId, mode } = action.payload;
  if (!state[mapId]) {
    return state;
  }

  return {
    ...state,
    [mapId]: {
      ...state[mapId],
      mode,
    },
  };
}

/*
 * Create reducer map and initial state.
 */
const initialState = { mapIds: [] };

export default handleActions({
  [createMap]: createMapReducer,
  [setMapLoaded]: setMapLoadedReducer,
  [mapWillUnload]: setMapUnloadedReducer,
  [setMapStyle]: setMapStyleReducer,
  [setLayerVisibility]: setLayerVisibilityReducer,
  [setGeneratedMapStyle]: setGeneratedMapStyleReducer,
  [flyTo]: flyToReducer,
  [setMapMode]: setMapModeReducer,
  // Add all the reducers handling draw specific map actions.
  ...drawReducers,
}, initialState);
