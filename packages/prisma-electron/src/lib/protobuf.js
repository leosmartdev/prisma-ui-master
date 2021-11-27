import ol from 'openlayers';

import Projection from './geo';

export const toStyleRGBA = proto => {
  const red = proto.r || 0;
  const green = proto.g || 0;
  const blue = proto.b || 0;
  const alpha = proto.a !== undefined ? proto.a : 1;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const toStyleRGB = proto => {
  const red = proto.r || 0;
  const green = proto.g || 0;
  const blue = proto.b || 0;

  return `rgb(${red}, ${green}, ${blue})`;
};

export const fromRGBA = color => ({
  red: color.r || 0,
  green: color.g || 0,
  blue: color.b || 0,
  alpha: color.a ? parseInt(color.a * 255, 10) : 255,
});

export const toRGBA = color => ({
  r: color.red || 0,
  g: color.green || 0,
  b: color.blue || 0,
  a: color.alpha ? color.alpha / 255.0 : 1.0,
});

export const fromPolygon = poly => {
  const lines = [];
  poly.forEach(ring => {
    const points = [];
    ring.forEach(point => {
      points.push({
        longitude: point[0],
        latitude: point[1],
      });
    });
    lines.push({ points });
  });

  return { lines };
};

export const toPolygon = poly => {
  const coords = [];
  if (!poly || !poly.lines) {
    return coords;
  }
  poly.lines.forEach(line => {
    const coord = [];
    if (!line) {
      return;
    }
    line.points.forEach(point => {
      coord.push([point.longitude || 0, point.latitude || 0]);
    });
    coords.push(coord);
  });
  return coords;
};

export const toFeature = proto => {
  const properties = Object.assign({}, proto.data);
  properties.id = proto.id;
  let geom = null;
  if (proto.data.poly) {
    const coords = Projection.toMercatorPolygon(toPolygon(proto.data.poly));
    geom = new ol.geom.Polygon(coords);
  }
  const feature = new ol.Feature(geom);
  feature.setProperties(properties);
  return feature;
};

const projections = new Map([['EPSG:4326', 0], ['EPSG:3857', 1]]);

export const fromEPSG = epsg => {
  if (!projections.has(epsg)) {
    throw new Error(`No protobuf projection for ${epsg}`);
  }
  return projections.get(epsg);
};
