import ol from 'openlayers';
import Projection from 'lib/geo';

describe('lib/geo/proj', () => {
  it('should reproject a point', () => {
    const coords = ol.proj.fromLonLat([1, 1]);
    const result = Projection.toLonLatCoordinates(coords);
    expect(result).toEqual([1, 1]);
  });

  it('should reproject a line', () => {
    const coords = [ol.proj.fromLonLat([1, 1]), ol.proj.fromLonLat([2, 2])];
    const result = Projection.toLonLatCoordinates(coords);
    expect(result).toEqual([[1, 1], [2, 2]]);
  });

  it('should reproject a EPSG:3857 feature to EPSG:4326', () => {
    const coords = [ol.proj.fromLonLat([1, 1]), ol.proj.fromLonLat([2, 2])];
    const feature = {
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
      properties: {
        crs: 'EPSG:3857',
      },
    };
    const result = Projection.toLonLat(feature);
    expect(result.geometry.coordinates).toEqual([[1, 1], [2, 2]]);
  });

  it('should pass through a EPSG:4326 feature', () => {
    const coords = [[1, 1], [2, 2]];
    const feature = {
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
      properties: {
        crs: 'EPSG:4326',
      },
    };
    const result = Projection.toLonLat(feature);
    expect(result.geometry.coordinates).toEqual([[1, 1], [2, 2]]);
  });

  it('should throw an execption on an unknown CRS', () => {
    const coords = [[1, 1], [2, 2]];
    const feature = {
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
      properties: {
        crs: 'EPSG:1234',
      },
    };
    expect(() => Projection.toLonLat(feature)).toThrowError(Error);
  });

  it('should reproject a polygon', () => {
    const poly = [
      [
        ol.proj.fromLonLat([0, 0]),
        ol.proj.fromLonLat([0, 1]),
        ol.proj.fromLonLat([1, 1]),
        ol.proj.fromLonLat([1, 0]),
        ol.proj.fromLonLat([0, 0]),
      ],
    ];
    const result = Projection.toLonLatPolygon(poly);
    expect(result).toEqual([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]);
  });

  it('should reproject an OpenLayers polygon', () => {
    const poly = new ol.geom.Polygon([
      [
        ol.proj.fromLonLat([0, 0]),
        ol.proj.fromLonLat([0, 1]),
        ol.proj.fromLonLat([1, 1]),
        ol.proj.fromLonLat([1, 0]),
        ol.proj.fromLonLat([0, 0]),
      ],
    ]);
    const result = Projection.toLonLatPolygon(poly);
    expect(result.getCoordinates()).toEqual([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]);
  });

  it('should reproject a linestring', () => {
    const line = [
      ol.proj.fromLonLat([0, 0]),
      ol.proj.fromLonLat([0, 1]),
      ol.proj.fromLonLat([1, 1]),
      ol.proj.fromLonLat([1, 0]),
      ol.proj.fromLonLat([0, 0]),
    ];
    const result = Projection.toLonLatLineString(line);
    expect(result).toEqual([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]);
  });

  it('should reproject an OpenLayers linestring', () => {
    const line = new ol.geom.LineString([
      ol.proj.fromLonLat([0, 0]),
      ol.proj.fromLonLat([0, 1]),
      ol.proj.fromLonLat([1, 1]),
      ol.proj.fromLonLat([1, 0]),
      ol.proj.fromLonLat([0, 0]),
    ]);
    const result = Projection.toLonLatLineString(line);
    expect(result.getCoordinates()).toEqual([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]);
  });
});
