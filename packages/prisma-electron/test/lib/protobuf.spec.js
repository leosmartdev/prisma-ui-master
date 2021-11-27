import * as Protobuf from 'lib/protobuf';

describe('lib/protobuf', () => {
  it('should convert to a stylesheet rgba color', () => {
    const proto = {
      r: 200,
      b: 100,
      a: 0.5,
    };
    const result = Protobuf.toStyleRGBA(proto);
    expect(result).toBe('rgba(200, 0, 100, 0.5)');
  });

  it('should convert to a stylesheet rgb color', () => {
    const proto = {
      r: 200,
      b: 100,
      a: 0.5,
    };
    const result = Protobuf.toStyleRGB(proto);
    expect(result).toBe('rgb(200, 0, 100)');
  });

  it('should convert from a polygon', () => {
    const poly = [[
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ]];
    const result = Protobuf.fromPolygon(poly);
    expect(result).toEqual({
      lines: [{
        points: [{
          longitude: 0,
          latitude: 0,
        }, {
          longitude: 0,
          latitude: 1,
        }, {
          longitude: 1,
          latitude: 1,
        }, {
          longitude: 1,
          latitude: 0,
        }, {
          longitude: 0,
          latitude: 0,
        }],
      }],
    });
  });

  it('should map WGS-84 to a protobuf enumeration', () => {
    expect(Protobuf.fromEPSG('EPSG:4326')).toBe(0);
  });

  it('should map Web Mercator to a protobuf enumeration', () => {
    expect(Protobuf.fromEPSG('EPSG:3857')).toBe(1);
  });

  it('should throw an exceptoin on an unknown projection', () => {
    expect(() => Protobuf.fromESPG('EPSG:9999')).toThrowError(Error);
  });
});

