/* eslint-disable no-param-reassign */

export function setupMapboxGlMocks(
  mapboxgl,
  latitude = 0,
  longitude = 0,
  zoom = 4,
  bearing = 0,
  pitch = 0,
  bounds = {
    north: 45,
    south: -45,
    east: 100,
    west: -100,
  },
) {
  mapboxgl.Map.prototype.getCenter = jest.fn(() => ({
    lat: latitude,
    lng: longitude,
  }));
  mapboxgl.Map.prototype.getBounds = jest.fn(() => ({
    getNorth: jest.fn(() => bounds.north),
    getSouth: jest.fn(() => bounds.south),
    getEast: jest.fn(() => bounds.east),
    getWest: jest.fn(() => bounds.west),
  }));
  mapboxgl.Map.prototype.getBearing = jest.fn(() => bearing);
  mapboxgl.Map.prototype.getPitch = jest.fn(() => pitch);
  mapboxgl.Map.prototype.getZoom = jest.fn(() => zoom);
}

export function setupMapboxGlDrawMocks(MapboxDraw) {
  MapboxDraw.prototype.getMode = jest.fn(() => 'simple_select');
}
