import ol from 'openlayers';

const geojson = new ol.format.GeoJSON();

export const toFeature = object => {
  if (object.setProperties) {
    return object;
  }
  const geometry = geojson.readGeometry(object.geometry);
  const feature = new ol.Feature(geometry);
  feature.setProperties(object.properties);
  return feature;
};

export const fromFeature = object => {
  if (object.geometry && object.properties) {
    return object;
  }
  return geojson.writeFeatureObject(object);
};
