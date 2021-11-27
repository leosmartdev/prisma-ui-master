/**
 * Returns the current drawTool for a map.
 * @param {object} state redux state
 * @param {string} mapId ID of the map.
 * @return {string} drawTool
 */
export function getDrawToolForMap(state, mapId) {
  const { map } = state['@prisma/map'];
  if (map[mapId] && map[mapId].draw) {
    return map[mapId].draw.tool || 'select';
  }
  return null;
}

/**
 * Returns the incoming draw feature for a map. This is not the active
 * feature on the draw tool, but only a way to send a feature to the draw tool.
 * @param {object} state redux state
 * @param {string} mapId ID of the map.
 * @return {string} feature
 */
export function getInputDrawFeatureForMap(state, mapId) {
  const { map } = state['@prisma/map'];
  if (map[mapId] && map[mapId].draw) {
    return map[mapId].draw.featureIn || null;
  }
  return null;
}

/**
 * Returns the finished draw feature for a map. This IS the active
 * feature on the draw tool and the final version as modified by the user.
 * @param {object} state redux state
 * @param {string} mapId ID of the map.
 * @return {string} feature
 */
export function getOutputDrawFeatureForMap(state, mapId) {
  const { map } = state['@prisma/map'];
  if (map[mapId] && map[mapId].draw) {
    return map[mapId].draw.featureOut || null;
  }
  return null;
}
