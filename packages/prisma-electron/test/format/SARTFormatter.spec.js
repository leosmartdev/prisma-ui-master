import SARTFormatter, { SARTAlertFormatter } from '../../src/format/SARTFormatter';

describe('format/SARTFormatter', () => {
  let formatter;
  beforeEach(function() {
    formatter = new SARTFormatter();
  });

  describe('mmsi()', () => {
    it('Returns MOB when mmsi starts with 972', function() {
      const track = { target: { nmea: { vdm: { m1371: { mmsi: '972XXXXXX' } } } } };

      expect(formatter.mmsi(track)).toEqual('MOB:972XXXXXX');
    });

    it('Returns EPIRB when mmsi starts with 974', function() {
      const track = { target: { nmea: { vdm: { m1371: { mmsi: '974XXXXXX' } } } } };

      expect(formatter.mmsi(track)).toEqual('EPIRB:974XXXXXX');
    });

    it('Returns SART when mmsi starts with anything else', function() {
      const track = { target: { nmea: { vdm: { m1371: { mmsi: '123XXXXXX' } } } } };

      expect(formatter.mmsi(track)).toEqual('SART:123XXXXXX');
    });

    it('Returns Unknown when no mmsi is passed', function() {
      const track = {};

      expect(formatter.mmsi(track)).toEqual('SART:Unknown MMSI');
    });
  });

  describe('sublabel()', () => {
    it('Returns Man Overboard when mmsi starts with 972', function() {
      const track = { target: { nmea: { vdm: { m1371: { mmsi: '972XXXXXX' } } } } };

      expect(formatter.sublabel(track)).toEqual('Man Overboard');
    });

    it('Returns EPIRB when mmsi starts with 974', function() {
      const track = { target: { nmea: { vdm: { m1371: { mmsi: '974XXXXXX' } } } } };

      expect(formatter.sublabel(track)).toEqual('Emergency Position Indicating Radio Beacon');
    });

    it('Returns Search and Rescue Transponder when mmsi starts with anything else', function() {
      const track = { target: { nmea: { vdm: { m1371: { mmsi: '123XXXXXX' } } } } };

      expect(formatter.sublabel(track)).toEqual('Search and Rescue Transponder');
    });
  });
});

describe('format/SARTAlertFormatter', () => {
  let formatter;
  beforeEach(function() {
    formatter = new SARTAlertFormatter();
  });

  describe('label()', () => {
    it('Returns mmsi', function() {
      const track = { target: { mmsi: '972XXXXXX' } };

      expect(formatter.label(track)).toEqual('972XXXXXX');
    });

    it('Returns Unknown when no mmsi is passed', function() {
      const track = {};

      expect(formatter.label(track)).toEqual('Unknown MMSI');
    });
  });

  describe('sublabel()', () => {
    it('Returns Man Overboard when mmsi starts with 972', function() {
      const track = { target: { mmsi: '972XXXXXX' } };

      expect(formatter.sublabel(track)).toEqual('Man Overboard');
    });

    it('Returns EPIRB when mmsi starts with 974', function() {
      const track = { target: { mmsi: '974XXXXXX' } };

      expect(formatter.sublabel(track)).toEqual('EPIRB');
    });

    it('Returns Search and Rescue Transponder when mmsi starts with anything else', function() {
      const track = { target: { mmsi: '123XXXXXX' } };

      expect(formatter.sublabel(track)).toEqual('Search and Rescue Transponder');
    });
  });
});
