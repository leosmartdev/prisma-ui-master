import ol from 'openlayers';

// radius at equator
const wgs84Sphere = new ol.Sphere(6378137);

// line is an ol.geom.LineString in WGS-84
// returns length in meters
//
// From: http://openlayers.org/en/latest/examples/measure.html
export const length = line => {
  const coordinates = line.getCoordinates();
  let result = 0;
  for (let i = 0; i < coordinates.length - 1; i += 1) {
    const c1 = coordinates[i];
    const c2 = coordinates[i + 1];
    result += wgs84Sphere.haversineDistance(c1, c2);
  }
  return result;
};

// FIXME: remove length
export const lineDistance = length;

// c1 and c2 are [lon, lat] in WGS-84
// returns angle in degrees
//
// From: http://www.movable-type.co.uk/scripts/latlong.html
//    var y = Math.sin(λ2-λ1) * Math.cos(φ2);
//    var x = Math.cos(φ1)*Math.sin(φ2) -
//            Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
//    var brng = Math.atan2(y, x).toDegrees();
export const azimuth = (c1, c2) => {
  const lon1 = deg2rad(c1[0]);
  const lat1 = deg2rad(c1[1]);
  const lon2 = deg2rad(c2[0]);
  const lat2 = deg2rad(c2[1]);

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let bearing = rad2deg(Math.atan2(y, x));
  if (bearing < 0) {
    bearing = 360 + bearing;
  }
  return bearing;
};

export const rad2deg = radians => radians * (180 / Math.PI);

export const deg2rad = degrees => degrees * (Math.PI / 180);
