import Formatter from '../../src/format/Formatter';
import { DegreesMinutesFormatter, DecimalFormatter } from '../../src/format/CoordinateFormatter';

describe('format/Formatter', () => {
  let formatter;

  beforeEach(() => {
    formatter = new Formatter();
  });

  describe('constructor()', () => {
    it('with defaults', () => {
      formatter = new Formatter();

      expect(formatter.noValue).toEqual('-');
      expect(formatter.coordinateFormat).toEqual(DegreesMinutesFormatter);
      expect(formatter.config).toEqual({
        distance: 'nauticalMiles',
        shortDistance: 'meters',
        speed: 'knots',
        coordinateFormat: 'degreesMinutes',
        timeZone: 'UTC',
      });
    });

    it('with config overrides', () => {
      const overrides = {
        distance: 'kilometers',
        shortDistance: 'feet',
        speed: 'knots',
        coordinateFormat: 'decimal',
        timeZone: 'EDT',
      };

      formatter = new Formatter(overrides);

      expect(formatter.noValue).toEqual('-');
      expect(formatter.coordinateFormat).toEqual(DecimalFormatter);
      expect(formatter.config).toEqual(overrides);
    });

    it('with config overrides and invalid speed', () => {
      const overrides = {
        speed: 'foo',
      };

      formatter = new Formatter(overrides);

      expect(formatter.speed).toEqual(null);
    });
  });

  describe('latitude()', () => {
    it('calls formatter when value is passed', () => {
      formatter.coordinateFormat.latitude = jest.fn(() => '12.5');

      const stringLatitude = formatter.latitude(12.5);
      expect(formatter.coordinateFormat.latitude).toBeCalledTimes(1);
      expect(formatter.coordinateFormat.latitude).toBeCalledWith(12.5);
      expect(stringLatitude).toEqual('12.5');
    });

    it('returns no value with value is not passed', () => {
      formatter.coordinateFormat.latitude = jest.fn();

      const stringLatitude = formatter.latitude();
      expect(formatter.coordinateFormat.latitude).toBeCalledTimes(0);
      expect(stringLatitude).toEqual('-');
    });

    it('returns no value with value is null', () => {
      formatter.coordinateFormat.latitude = jest.fn();

      const stringLatitude = formatter.latitude(null);
      expect(formatter.coordinateFormat.latitude).toBeCalledTimes(0);
      expect(stringLatitude).toEqual('-');
    });
  });

  describe('longitude()', () => {
    it('calls formatter when value is passed', () => {
      formatter.coordinateFormat.longitude = jest.fn(() => '12.5');

      const stringLongitude = formatter.longitude(12.5);
      expect(formatter.coordinateFormat.longitude).toBeCalledTimes(1);
      expect(formatter.coordinateFormat.longitude).toBeCalledWith(12.5);
      expect(stringLongitude).toEqual('12.5');
    });

    it('returns no value with value is not passed', () => {
      formatter.coordinateFormat.longitude = jest.fn();

      const stringLongitude = formatter.longitude();
      expect(formatter.coordinateFormat.longitude).toBeCalledTimes(0);
      expect(stringLongitude).toEqual('-');
    });

    it('returns no value with value is null', () => {
      formatter.coordinateFormat.longitude = jest.fn();

      const stringLongitude = formatter.longitude(null);
      expect(formatter.coordinateFormat.longitude).toBeCalledTimes(0);
      expect(stringLongitude).toEqual('-');
    });
  });

  describe('knotsValue()', () => {
    it('integer value', () => {
      const stringKnots = formatter.knotsValue(12);
      expect(stringKnots).toEqual('12.0');
    });

    it('float with single decimal', () => {
      const stringKnots = formatter.knotsValue(45.9);
      expect(stringKnots).toEqual('45.9');
    });

    it('float with two decimals (round up)', () => {
      const stringKnots = formatter.knotsValue(45.95);
      expect(stringKnots).toEqual('46.0');
    });

    it('float with two decimals (round down)', () => {
      const stringKnots = formatter.knotsValue(45.94);
      expect(stringKnots).toEqual('45.9');
    });

    it('returns no value with value is not passed', () => {
      const stringKnots = formatter.knotsValue();
      expect(stringKnots).toEqual('-');
    });

    it('returns no value with value is null', () => {
      const stringKnots = formatter.knotsValue(null);
      expect(stringKnots).toEqual('-');
    });
  });

  describe('metersPerSecondValue()', () => {
    beforeEach(() => {
      formatter.setConfig({
        ...formatter.config,
        speed: 'metersPerSecond',
      });
    });

    it('integer value', () => {
      const stringMPS = formatter.metersPerSecondValue(12);
      expect(stringMPS).toEqual('12.0');
    });

    it('float with single decimal', () => {
      const stringMPS = formatter.metersPerSecondValue(45.9);
      expect(stringMPS).toEqual('45.9');
    });

    it('float with two decimals (round up)', () => {
      const stringMPS = formatter.metersPerSecondValue(45.95);
      expect(stringMPS).toEqual('46.0');
    });

    it('float with two decimals (round down)', () => {
      const stringMPS = formatter.metersPerSecondValue(45.94);
      expect(stringMPS).toEqual('45.9');
    });

    it('returns no value with value is not passed', () => {
      const stringMPS = formatter.metersPerSecondValue();
      expect(stringMPS).toEqual('-');
    });

    it('returns no value with value is null', () => {
      const stringMPS = formatter.metersPerSecondValue(null);
      expect(stringMPS).toEqual('-');
    });
  });

  describe('metersValue()', () => {
    beforeEach(() => {
      formatter.setConfig({
        ...formatter.config,
        distance: 'meters',
      });
    });

    it('integer value', () => {
      const stringMeters = formatter.metersValue(12);
      expect(stringMeters).toEqual('12.0');
    });

    it('float with single decimal', () => {
      const stringMeters = formatter.metersValue(45.9);
      expect(stringMeters).toEqual('45.9');
    });

    it('float with two decimals (round up)', () => {
      const stringMeters = formatter.metersValue(45.95);
      expect(stringMeters).toEqual('46.0');
    });

    it('float with two decimals (round down)', () => {
      const stringMeters = formatter.metersValue(45.94);
      expect(stringMeters).toEqual('45.9');
    });

    it('returns no value with value is not passed', () => {
      const stringMeters = formatter.metersValue();
      expect(stringMeters).toEqual('-');
    });

    it('returns no value with value is null', () => {
      const stringMeters = formatter.metersValue(null);
      expect(stringMeters).toEqual('-');
    });

    it('converts to nautical miles', () => {
      formatter.setConfig({
        ...formatter.config,
        distance: 'nauticalMiles',
      });
      const stringMeters = formatter.metersValue(1234567);
      expect(stringMeters).toEqual('666.6');
    });
  });

  describe('metersValue()', () => {
    it('integer value', () => {
      const stringMeters = formatter.metersShortValue(12, 0);
      expect(stringMeters).toEqual('12');
    });

    it('defaults to value', () => {
      const stringMeters = formatter.metersShortValue(12.12345);
      expect(stringMeters).toEqual('12');
    });

    it('float with single decimal', () => {
      const stringMeters = formatter.metersShortValue(45.9, 1);
      expect(stringMeters).toEqual('45.9');
    });

    it('pads numbers less than digits', () => {
      const stringMeters = formatter.metersShortValue(45.9, 10);
      expect(stringMeters).toEqual('45.9000000000');
    });

    it('float with two decimals (round up) to single', () => {
      const stringMeters = formatter.metersShortValue(45.95, 1);
      expect(stringMeters).toEqual('46.0');
    });

    it('float with two decimals (round down) to single', () => {
      const stringMeters = formatter.metersShortValue(45.94, 1);
      expect(stringMeters).toEqual('45.9');
    });

    it('returns no value with value is not passed', () => {
      const stringMeters = formatter.metersShortValue();
      expect(stringMeters).toEqual('-');
    });

    it('returns no value with value is null', () => {
      const stringMeters = formatter.metersShortValue(null);
      expect(stringMeters).toEqual('-');
    });

    it('converts to feet', () => {
      formatter.setConfig({
        ...formatter.config,
        shortDistance: 'feet',
      });
      const stringMeters = formatter.metersShortValue(1234567, 2);
      expect(stringMeters).toEqual('4050416.80');
    });
  });

  describe('angleValue()', () => {
    it('integer value', () => {
      const stringAngle = formatter.angleValue(12);
      expect(stringAngle).toEqual('12.0');
    });

    it('float with single decimal', () => {
      const stringAngle = formatter.angleValue(45.9);
      expect(stringAngle).toEqual('45.9');
    });

    it('float with two decimals (round up)', () => {
      const stringAngle = formatter.angleValue(45.95);
      expect(stringAngle).toEqual('46.0');
    });

    it('float with two decimals (round down)', () => {
      const stringAngle = formatter.angleValue(45.94);
      expect(stringAngle).toEqual('45.9');
    });

    it('returns no value with value is not passed', () => {
      const stringAngle = formatter.angleValue();
      expect(stringAngle).toEqual('-');
    });

    it('returns no value with value is null', () => {
      const stringAngle = formatter.angleValue(null);
      expect(stringAngle).toEqual('-');
    });
  });

  describe('timeSince()', () => {
    it('time 30 minutes in future', () => {
      const timeSince = formatter.timeSince(new Date(Date.now() + 30 * 60000));
      expect(timeSince).toEqual('in 30 minutes');
    });

    it('time in the past', () => {
      const timeSince = formatter.timeSince(new Date(Date.now() - 30 * 60000));
      expect(timeSince).toEqual('30 minutes ago');
    });

    it('time now', () => {
      const timeSince = formatter.timeSince(Date.now());
      expect(timeSince).toEqual('a few seconds ago');
    });

    it('returns no value with value is not passed', () => {
      const timeSince = formatter.timeSince();
      expect(timeSince).toEqual('-');
    });

    it('returns no value with value is null', () => {
      const timeSince = formatter.timeSince(null);
      expect(timeSince).toEqual('-');
    });
  });

  describe('age()', () => {
    it('time 30 minutes in future', () => {
      const age = formatter.age(new Date(Date.now() + 30 * 60000));
      expect(age).toBeGreaterThanOrEqual(-1801);
      expect(age).toBeLessThanOrEqual(-1799);
    });

    it('time in the past', () => {
      const age = formatter.age(new Date(Date.now() - 30 * 60000));
      expect(age).toBeLessThanOrEqual(1801);
      expect(age).toBeGreaterThanOrEqual(1799);
    });

    it('time now', () => {
      const age = formatter.age(new Date(Date.now()));
      expect(age).toBeLessThanOrEqual(1);
      expect(age).toBeGreaterThanOrEqual(-1);
    });

    it('returns no value with value is not passed', () => {
      expect(formatter.age()).toEqual(-1);
    });

    it('returns no value with value is null', () => {
      expect(formatter.age(null)).toEqual(-1);
    });
  });

  describe('getConnectionStatus()', () => {
    it('returns empty string', () => {
      expect(formatter.getConnectionStatus()).toEqual('');
    });
  });

  describe('coordinates2()', () => {
    it('returns null', () => {
      expect(formatter.coordinates2()).toEqual(null);
    });
  });
});
