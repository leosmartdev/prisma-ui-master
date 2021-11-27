import { expand } from 'lib/object';
import RadarFormatter from '../../src/format/RadarFormatter';

const noValue = '-';

const feature = (id, properties, coordinates) => {
  coordinates = coordinates || [0, 0];
  properties.target = properties.target || {};
  properties.target.position = {
    longitude: coordinates[0],
    latitude: coordinates[1],
  };
  return properties;
};

const empty = {
  properties: {},
};

describe('format/RadarFormatter', () => {
  let format;
  beforeEach(function() {
    format = new RadarFormatter({
      distance: 'nauticalMiles',
      shortDistance: 'meters',
      speed: 'knots',
      coordinates: 'degreesMinutes',
      timeZone: 'UTC',
    });
  });

  describe('values', () => {
    it('should format a label with the target number', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.number': 7,
          'target.type': 'Radar',
        }),
      );
      expect(format.label(f)).toBe('Target #7');
    });

    it('should format a sublabel', function() {
      const f = feature(
        '1',
        expand({
          'target.type': 'Radar',
        }),
      );
      expect(format.sublabel(f)).toBeTruthy();
    });

    it('should format a sublabel for VTS radar', function() {
      const f = feature(
        '1',
        expand({
          'target.type': 'VTSRadar',
        }),
      );
      expect(format.sublabel(f)).toBe('Radar - VTS');
    });

    it('should format a distance', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.speedDistanceUnits': 'N',
          'target.nmea.ttm.distance': 14.3,
        }),
      );
      expect(format.distance(f)).toBe('14.30 NM');
    });

    it('should format a distance from kilometers', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.speedDistanceUnits': 'K',
          'target.nmea.ttm.distance': 14.3,
        }),
      );
      expect(format.distance(f)).toBe('7.72 NM');
    });

    it('should format a CPA distance', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.speedDistanceUnits': 'N',
          'target.nmea.ttm.cpaDistance': 14.3,
        }),
      );
      expect(format.cpaDistance(f)).toBe('14.3 NM');
    });

    it('should format a CPA distance from kilometers', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.speedDistanceUnits': 'K',
          'target.nmea.ttm.cpaDistance': 14.3,
        }),
      );
      expect(format.cpaDistance(f)).toBe('7.7 NM');
    });

    it('should format a CPA time', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.cpaTime': 14.3,
        }),
      );
      expect(format.cpaTime(f)).toBe('14.3 min');
    });

    it('should format a CPA time with rounded decimal', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.cpaTime': 14.328,
        }),
      );
      expect(format.cpaTime(f)).toBe('14.3 min');
    });

    it('should format an increasing CPA time', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.cpaTime': -14.3,
        }),
      );
      expect(format.cpaTime(f)).toBe('14.3 min (increasing)');
    });

    it('should format a speed', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.speedDistanceUnits': 'N',
          'target.nmea.ttm.speed': 14.322,
        }),
      );
      expect(format.speed(f)).toBe('14.3 kn');
    });

    it('should format a speed from km/h', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.speedDistanceUnits': 'K',
          'target.nmea.ttm.speed': 14.3,
        }),
      );
      expect(format.speed(f)).toBe('7.7 kn');
    });

    it('should format an acquisition type', function() {
      const f = feature(
        '1',
        expand({
          'target.nmea.ttm.acquisitionType': 'M',
        }),
      );
      expect(format.acquisitionType(f)).toBe('Manual');
    });
  });

  describe('no values', () => {
    it('should format a distance', function() {
      const f = feature('1', empty);
      expect(format.distance(f)).toBe(noValue);
    });

    it('should format a CPA distance', function() {
      const f = feature('1', empty);
      expect(format.cpaDistance(f)).toBe(noValue);
    });

    it('should format a CPA time', function() {
      const f = feature('1', empty);
      expect(format.cpaTime(f)).toBe(noValue);
    });

    it('should format a speed', function() {
      const f = feature('1', empty);
      expect(format.speed(f)).toBe(noValue);
    });

    it('should format an acquisition type', function() {
      const f = feature('1', empty);
      expect(format.acquisitionType(f)).toBe(noValue);
    });
  });
});
