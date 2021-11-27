import i18n from 'lib/i18n';
import * as Country from 'lib/country';

describe('lib/country', () => {
  afterEach(() => {
    i18n.changeLanguage('en-US');
  });

  describe('iso2', () => {
    it('should find the country for the US', () => {
      expect(Country.fromISO2('US').name).toBe('United States of America');
    });

    xit(
      'should find the country for the US and translate into French',
      () => {
        i18n.changeLanguage('fr');
        expect(Country.fromISO2('US').name).toBe("États-Unis d'Amérique");
      },
    );

    it('should return - on an invalid country', () => {
      expect(Country.fromISO2('ZZZ').name).toBe('-');
    });
  });

  describe('mid', () => {
    it('should return the US for MID 303', () => {
      expect(Country.fromMID(303).iso2).toBe('US');
    });

    it('should throw an error on an unexpected MID', () => {
      expect(Country.fromMID(999).name).toBe('-');
    });
  });

  describe('fromMMSI', () => {
    it('should call fromMID and return empty with invalid MMSI', () => {
      const country = Country.fromMMSI('000000000');
      expect(country.iso2).toBe('-');
    });

    it('VHF coast station throws error', () => {
      expect(() => Country.fromMMSI('009900000')).toThrowError(Error);
    });

    it('00 mmsi for RE', () => {
      const country = Country.fromMMSI('006600000');
      expect(country.iso2).toBe('RE');
    });

    it('0 mmsi for JM', () => {
      const country = Country.fromMMSI('033900000');
      expect(country.iso2).toBe('JM');
    });

    it('Other mmsi (US)', () => {
      const country = Country.fromMMSI('367000000');
      expect(country.iso2).toBe('US');
    });
  });

  describe('flag', () => {
    it('should have a flag for every ISO2 code', () => {
      Country.tables.iso2.forEach((name, code) => {
        const country = Country.fromISO2(code);
        if (!country.flag) {
          throw new Error(`No flag for ${country.name} (${country.iso2})`);
        }
      });
    });
  });
});

