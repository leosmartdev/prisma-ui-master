import { expand } from 'lib/object';
import AISFormatter from '../../src/format/AISFormatter';

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

describe('format/AISFormatter', () => {
  let format;
  beforeEach(function() {
    format = new AISFormatter({
      distance: 'nauticalMiles',
      shortDistance: 'meters',
      speed: 'knots',
      coordinates: 'degreesMinutes',
      timeZone: 'UTC',
    });
  });

  describe('values', () => {
    it('should format a label with the name', function() {
      const f = feature('1', expand({ 'metadata.name': 'BIG GUN ' }));
      expect(format.label(f)).toBe('BIG GUN');
    });

    it('should format a large rate of turn, right', function() {
      const f = feature('1', expand({ 'target.rateOfTurn': 800 }));
      expect(format.rateOfTurn(f)).toBe('> 720°/min right');
    });

    it('should format a large rate of turn, left', function() {
      const f = feature('1', expand({ 'target.rateOfTurn': -800 }));
      expect(format.rateOfTurn(f)).toBe('> 720°/min left');
    });

    it('should format a rate of turn', function() {
      const f = feature('1', expand({ 'target.rateOfTurn': 12.276 }));
      expect(format.rateOfTurn(f)).toBe('12.3°/min right');
    });

    it('should format a large speed', function() {
      const f = feature('1', expand({ 'target.speed': 200 }));
      expect(format.speed(f)).toBe('> 102.2 kn');
    });

    it('should format a speed', function() {
      const f = feature('1', expand({ 'target.speed': 11.47 }));
      expect(format.speed(f)).toBe('11.5 kn');
    });

    it('should format an MMSI from a target', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.mmsi': '563002830' }));
      expect(format.mmsi(f)).toBe('563002830');
    });

    it('should format a country name', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.mmsi': 563002830 }));
      expect(format.country(f)).toBe('Singapore');
    });

    it('should return an empty country name with an invalid MMSI', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.mmsi': 1 }));
      expect(format.country(f)).toBe('-');
    });

    it('should return an empty country name with an <9 digits MMSI', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.mmsi': 1305 }));
      expect(format.country(f)).toBe('-');
    });

    it('should format a navigational status', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.pos.navigationalStatus': 2 }));
      expect(format.navigationalStatus(f)).toBe('Not under command');
    });

    it('should format a position accuracy', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.pos.positionAccuracy': true }));
      expect(format.positionAccuracy(f)).toBe('High');
    });

    it('should format a RAIM flag', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.pos.raimFlag': true }));
      expect(format.raim(f)).toBe('Yes');
    });

    it('should format special maneuver', function() {
      const f = feature('1', expand({ 'target.nmea.vdm.m1371.pos.specialManoeuvre': 2 }));
      expect(format.specialManeuver(f)).toBe('Engaged');
    });

    it('should format an IMO number', function() {
      const f = feature('1', expand({ 'metadata.nmea.vdm.m1371.staticVoyage.imoNumber': 12345 }));
      expect(format.imo(f)).toBe('12345');
    });

    it('should format a callsign', function() {
      const f = feature(
        '1',
        expand({ 'metadata.nmea.vdm.m1371.staticVoyage.callSign': '9V7855 ' }),
      );
      expect(format.callsign(f)).toBe('9V7855');
    });

    it('should format a vessel type', function() {
      const f = feature(
        '1',
        expand({ 'metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType': 53 }),
      );
      expect(format.vesselType(f)).toBe('Port tender');
      const f2 = feature(
        '1',
        expand({ 'metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType': 62 }),
      );
      expect(format.vesselType(f2)).toBe('Passenger ship');
      const f3 = feature(
        '1',
        expand({ 'metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType': 31 }),
      );
      expect(format.vesselType(f3)).toBe('Towing');
      const f4 = feature(
        '1',
        expand({ 'metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType': 9 }),
      );
      expect(format.vesselType(f4)).toBe('Code 9');
    });

    it('should format a destination', function() {
      const f = feature(
        '1',
        expand({ 'metadata.nmea.vdm.m1371.staticVoyage.destination': 'DUTCH HARBOR ' }),
      );
      expect(format.destination(f)).toBe('DUTCH HARBOR');
    });

    it('should format a vessel length', function() {
      const f = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.dimBow': 10,
          'metadata.nmea.vdm.m1371.staticVoyage.dimStern': 5,
        }),
      );
      expect(format.length(f)).toBe('15 m');
      const f2 = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.dimBow': 10,
        }),
      );
      expect(format.length(f2)).toBe('10 m');
    });

    it('should format a vessel breadth', function() {
      const f = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.dimPort': 7,
          'metadata.nmea.vdm.m1371.staticVoyage.dimStarboard': 11,
        }),
      );
      expect(format.breadth(f)).toBe('18 m');
      const f2 = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.dimPort': 7,
        }),
      );
      expect(format.breadth(f2)).toBe('7 m');
    });

    it('should format a vessel draft', function() {
      const f = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.draught': 153,
        }),
      );
      expect(format.draft(f)).toBe('15.3 m');
      const f3 = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.draught': 0,
        }),
      );
      expect(format.draft(f3)).toBe('Not available');
    });

    it('should format a positioning device', function() {
      const f = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.positionDevice': 8,
        }),
      );
      expect(format.positioningDevice(f)).toBe('Galileo');
      const f2 = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.positionDevice': 9,
        }),
      );
      expect(format.positioningDevice(f2)).toBe('Code 9');
    });

    it('should format data terminal equipment', function() {
      const f = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.dataTerminalAvail': true,
        }),
      );
      expect(format.dataTerminalEquipment(f)).toBe('Available');
    });

    it('should format a vessel hazard', function() {
      const f = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType': 72,
        }),
      );
      expect(format.vesselHazard(f)).toBe('Category Y');
      const f2 = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType': 52,
        }),
      );
      expect(format.vesselHazard(f2)).toBe('');
      const f3 = feature(
        '1',
        expand({
          'metadata.nmea.vdm.m1371.staticVoyage.shipAndCargoType': 32,
        }),
      );
      expect(format.vesselHazard(f3)).toBe('');
    });
  });

  describe('no values', () => {
    it('should format a navigational status', function() {
      const f = feature('1', empty);
      expect(format.navigationalStatus(f)).toBe(noValue);
    });

    it('should format a position accuracy', function() {
      const f = feature('1', empty);
      expect(format.positionAccuracy(f)).toBe(noValue);
    });

    it('should format a RAIM flag', function() {
      const f = feature('1', empty);
      expect(format.raim(f)).toBe(noValue);
    });

    it('should format special maneuver', function() {
      const f = feature('1', empty);
      expect(format.specialManeuver(f)).toBe(noValue);
    });

    it('should format an IMO number', function() {
      const f = feature('1', empty);
      expect(format.imo(f)).toBe(noValue);
    });

    it('should format a call sign', function() {
      const f = feature('1', empty);
      expect(format.callsign(f)).toBe(noValue);
    });

    it('should format a vessel type', function() {
      const f = feature('1', empty);
      expect(format.vesselType(f)).toBe(noValue);
    });

    it('should format a destination', function() {
      const f = feature('1', empty);
      expect(format.destination(f)).toBe(noValue);
    });

    it('should format a vesssel length', function() {
      const f = feature('1', empty);
      expect(format.length(f)).toBe(noValue);
    });

    it('should format a vesssel breadth', function() {
      const f = feature('1', empty);
      expect(format.breadth(f)).toBe(noValue);
    });

    it('should format a vesssel draft', function() {
      const f = feature('1', empty);
      expect(format.draft(f)).toBe(noValue);
    });

    it('should format an ETA', function() {
      const f = feature('1', empty);
      expect(format.eta(f)).toBe(noValue);
    });

    it('should format a positioning device', function() {
      const f = feature('1', empty);
      expect(format.positioningDevice(f)).toBe(noValue);
    });

    it('should format data terminal equipment', function() {
      const f = feature('1', empty);
      expect(format.dataTerminalEquipment(f)).toBe(noValue);
    });

    it('should format a vessel hazard', function() {
      const f = feature('1', empty);
      expect(format.dataTerminalEquipment(f)).toBe(noValue);
    });
  });
});
