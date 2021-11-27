/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */
import { featureCollection } from '@turf/turf';
import { runLayerFilter } from './filters';

/**
 * Given a redux state, will create an array of mapbox gl style specification objects for sending
 * to all maps.
 *
 * This will do the following to generate the styles.
 *  1. Get all current map styles.
 *  2. Loop through every feature in the state.
 *  3. For each feature, see if the feature applies to a map by checking layer filter in priority
 *     order, adding the feature to the first layer where the filter applies. If no filter applies
 *     for a map, the feature will not be placed on that map. Priority order means, last layer in
 *     in the array, top layer on the map is checked first, then down.
 *
 * This is essentially taking the existing style object and re-calculating the `sources` property
 * will all the most current features and merging layers configurations for those layers and adding
 * them to the style as well. ONLY layers listed in a maps `map.layers.dynamicLayers` array are
 * computed with sources and layers generated for the map. Any layers already on the style object
 * will be ignored and new dynamic layers are placed after those layers on the style.
 *
 * @param {object} state the redux state containing the `@prisma/map` property.
 * @return {object} Object containing key,value pairs of `mapId` -> `style object`
 */
export function createStylesForAllMaps(state) {
  const { map } = state['@prisma/map'];

  const generatedStyles = getStylesForLoadedMaps(state);

  // Loop through all features
  // TODO: handle historicalFeatures
  Object.entries(state['@prisma/map'].features).forEach((entry) => {
    const feature = entry[1];
    // Loop through all loaded maps
    Object.entries(generatedStyles).forEach(([mapId]) => {
      // Find the layer, if any, this feature should be on.
      // We only look at layers marked as `dynamicLayers` on this map. Then we get the merged config
      // from global layer config and this maps specific layer configs then apply the filters to
      // see if the feature is on a specific layer. Layers are processed in priority order, so
      // reversed dynamicLayers.
      const dynamicLayers = map[mapId].layers.dynamicLayers.slice(0).reverse();
      const foundLayerId = dynamicLayers.find(layerId => (
        isFeatureOnLayer(feature, getLayerConfig(state, mapId, layerId))
      ));

      // add the feature to its source if the feature was placed on a layer.
      if (foundLayerId) {
        const sourceId = `generated:${foundLayerId}`;
        generatedStyles[mapId].sources[sourceId].data.features.push(feature);
      }
    });
  });

  return generatedStyles;
}

// Create an object of all the map styles, indexed by mapId
/**
 * Creates a generated style for all loaded maps in the state. Returns an object with a key for
 * each mapId and it's generated style as the value. Each style is the maps base style with a
 * generated source object and layer object add for each layerId listed in the maps dynamicLayers
 * array.
 *
 * @param {object} state full redux state
 * @return {object} key/value mapId: mapbox-gl spec style
 */
export function getStylesForLoadedMaps(state) {
  const { map } = state['@prisma/map'];
  const generatedStyles = map.mapIds.reduce((obj, mapId) => {
    const mapConfig = map[mapId];
    if (!mapConfig.loaded) {
      return obj;
    }

    let generated = { layers: [], sources: {} };
    if (mapConfig.layers && mapConfig.layers.dynamicLayers) {
      generated = map[mapId].layers.dynamicLayers.reduce((acc, layerId) => {
        const sourceId = `generated:${layerId}`;

        // Create the generated source object.
        acc.sources[sourceId] = {
          type: 'geojson',
          data: featureCollection([]),
        };

        // Create the generated layer object.
        acc.layers.push(getLayerConfig(state, mapId, layerId, true));

        return acc;
      }, { sources: {}, layers: [] });
    }

    return {
      ...obj,
      [mapId]: {
        ...map[mapId].style, // we make a copy of the saved style.
        layers: [
          ...map[mapId].style.layers, // If we dont do this we modify the existing layers array
          ...generated.layers,
        ],
        sources: {
          ...map[mapId].style.sources,
          ...generated.sources,
        },
      },
    };
  }, {});

  return generatedStyles;
}

/**
 * Merges and returns the full layer object for a specific map and layerId. This will take any
 * global configurations for the layer then add any overrides from the specific map, returning the
 * final layer object. If no configuration exist on the map or globally, will return null.
 *
 * @param {object} state The full redux state.
 * @param {string} mapId ID of the map to get a layer config for.
 * @param {string} layerId ID of the layer.
 * @return {object} Layer object that is the merge of the top level layer config
 * (state['@prisma/map'].layers[layerId]) and the map specific overrides or definition
 * (state['@prisma/map'].map[mapId].layers[layerId]).
 */
export function getLayerConfig(state, mapId, layerId, styleLayer = false) {
  const globalConfig = state['@prisma/map'].layers[layerId] || {};
  const mapConfig = state['@prisma/map'].map[mapId].layers[layerId] || {};

  let mergedConfig = {};
  // If this is going to be used in a mapbox style, we must ensure the layer is valid. This means
  // only copying the parts of layer object that map will understand: `id`,`paint`,`layout`,`type`
  if (styleLayer) {
    mergedConfig = {
      id: layerId,
      source: `generated:${layerId}`,
    };

    const type = mapConfig.type || globalConfig.type;
    if (type) {
      mergedConfig.type = type;
    }
    if (globalConfig.paint || mapConfig.paint) {
      mergedConfig.paint = {
        ...globalConfig.paint,
        ...mapConfig.paint,
      };
    }
    if (globalConfig.layout || mapConfig.layout) {
      mergedConfig.layout = {
        ...globalConfig.layout,
        ...mapConfig.layout,
      };
    }
  } else {
    // This isn't going to be used in a mapbox style, so just merge the two simply.
    mergedConfig = {
      ...globalConfig,
      ...mapConfig,
    };
  }

  return mergedConfig;
}

/**
 * Returns if the feature belongs on the provided layer.
 * First checks if `features` property exists on the layer, and if so, checks if the
 * feature ID is in the features list. If this check fails, then any filters in the `filter`
 * prop are applied and the boolean result is returned.
 *
 * // TODO: pass the feature source here to check if it matches the layer source?
 *
 * @param {object} feature The feature to check
 * @param {object} layer The layer to check if the feature should be a part of.
 * @return {boolean} true if the feature id is either in the features property or if it passes the
 *                   filter.
 */
export function isFeatureOnLayer(feature, layer) {
  if (!layer) {
    // If the layer doesnt exist then return false
    return false;
  }

  if (Array.isArray(layer.features)) {
    if (layer.features.includes(feature.id)) {
      return true;
    }
  }

  if (Array.isArray(layer.filter)) {
    return runLayerFilter(feature, layer.filter);
  }

  return false;
}

/**
 * Gets the generated style for the provided mapId from the state. If style cannot be found or map
 * does not exist, returns undefined.
 *
 * @return {object} Returns the mapbox-gl spec style OR undefined. Must be undefined and not null
 *                  if null, `<Map>` doesnt fallback to default style and map will fail to load.
 */
export function getGeneratedStyleForMap(state, mapId) {
  const { map } = state['@prisma/map'];
  if (map[mapId] && map[mapId].generatedStyle) {
    return map[mapId].generatedStyle;
  }
  return undefined;
}

/**
 * Gets the current flyTo center value for the provided mapID
 *
 * @return {object} center
 * @return {float} center.longitude
 * @return {float} center.latitude
 */
export function getFlyToPositionForMap(state, mapId) {
  const { map } = state['@prisma/map'];
  if (map[mapId] && map[mapId].flyTo) {
    return map[mapId].flyTo;
  }
  return {};
}

/**
 * Returns the current mode for a map.
 * @param {object} state redux state
 * @param {string} mapId ID of the map.
 * @return {string} mode
 */
export function getModeForMap(state, mapId) {
  const { map } = state['@prisma/map'];
  if (map[mapId]) {
    return map[mapId].mode || 'normal';
  }
  return null;
}
