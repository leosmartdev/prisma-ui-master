import ol from 'openlayers';
import clone from 'clone';

// export const toLonLat = ol.proj.toLonLat;

export const geomToLonLat = geom => geom.clone().transform('EPSG:3857', 'EPSG:4326');

export const geomFromLonLat = geom => geom.clone().transform('EPSG:4326', 'EPSG:3857');

// FIXME: look at getting rid of everything below

export const toLonLat = feature => {
  if (feature.properties.crs === 'EPSG:4326') {
    return feature;
  }
  if (feature.properties.crs !== 'EPSG:3857') {
    throw new Error('Unknown CRS: ', feature.properties.crs);
  }
  const newFeature = clone(feature);
  newFeature.geometry.coordinates = toLonLatCoordinates(newFeature.geometry.coordinates);
  return newFeature;
};

export const toLonLatCoordinates = coordinates => {
  // If the first value is an array, we are not at the coordinate level
  // let, pass it down.
  if (Array.isArray(coordinates[0])) {
    const proj = [];
    coordinates.forEach(arr => {
      proj.push(toLonLatCoordinates(arr));
    });
    return proj;
  }
  return ol.proj.toLonLat(coordinates);
};

export const toMercatorPolygon = poly => {
  const result = [];
  poly.forEach(ring => {
    result.push(ring.map(v => ol.proj.fromLonLat(v)));
  });
  return result;
};

// line: either an array of [lat, lon] or an ol.geom.LineString in EPSG:3857
// coordinates.
// returns: depending on the passed in value, an array of [lat, lon] or an
// ol.geom.LineString in EPSG:4326
export const toLonLatLineString = line => {
  let coords = line;
  if (line.getCoordinates) {
    coords = line.getCoordinates();
  }
  let result = coords.map(v => ol.proj.toLonLat(v));
  if (line.getCoordinates) {
    result = new ol.geom.LineString(result);
  }
  return result;
};

export const fromLonLatLineString = line => {
  let coords = line;
  if (line.getCoordinates) {
    coords = line.getCoordinates();
  }
  let result = coords.map(v => ol.proj.fromLonLat(v));
  if (line.getCoordinates) {
    result = new ol.geom.LineString(result);
  }
  return result;
};

export const toLonLatPolygon = poly => {
  let coords = poly;
  if (poly.getCoordinates) {
    coords = poly.getCoordinates();
  }
  let result = coords.map(v => toLonLatLineString(v));
  if (poly.getCoordinates) {
    result = new ol.geom.Polygon(result);
  }
  return result;
};

export const fromLonLatPolygon = poly => {
  let coords = poly;
  if (poly.getCoordinates) {
    coords = poly.getCoordinates();
  }
  let result = coords.map(v => fromLonLatLineString(v));
  if (poly.getCoordinates) {
    result = new ol.geom.Polygon(result);
  }
  return result;
};
