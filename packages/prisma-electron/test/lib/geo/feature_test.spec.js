import ol from 'openlayers';
import { Feature } from '../../../src/lib/geo';

describe('lib/geo/feature', () => {
  it('should convert to an OpenLayers feature', () => {
    const input = {
      geometry: {
        type: 'Point',
        coordinates: [1, 2],
      },
      properties: {
        foo: 'bar',
      },
    };
    const result = Feature.toFeature(input);
    expect(result.getGeometry().getCoordinates()).toEqual([1, 2]);
    expect(result.getProperties().foo).toBe('bar');
  });

  it('should pass through an OpenLayers feature', () => {
    const input = {
      geometry: {
        type: 'Point',
        coordinates: [1, 2],
      },
      properties: {
        foo: 'bar',
      },
    };
    const feature = Feature.toFeature(input);
    const result = Feature.toFeature(feature);
    expect(result.getProperties().foo).toBe('bar');
  });

  it('should convert to an object feature', () => {
    const input = new ol.Feature({
      geometry: new ol.geom.Point([1, 2]),
      foo: 'bar',
    });
    const result = Feature.fromFeature(input);
    expect(result.properties.foo).toBe('bar');
  });

  it('should pass through an object feature', () => {
    const input = new ol.Feature({
      geometry: new ol.geom.Point([1, 2]),
      foo: 'bar',
    });
    const object = Feature.fromFeature(input);
    const result = Feature.fromFeature(object);
    expect(result.properties.foo).toBe('bar');
  });
});
