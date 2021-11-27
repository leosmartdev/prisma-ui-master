import CoordinateFormatter, {
  DecimalFormatter,
  DegreesMinutesFormatter,
  DegreesMinutesSecondsFormatter,
} from '../../src/format/CoordinateFormatter';

describe('format/CoordinateFormattter', () => {
  describe('DecimalFormatter', () => {
    it('should format latitude 12.345 to 12.34500°', () => {
      expect(DecimalFormatter.latitude(12.345)).toBe('12.34500°');
    });

    it('should format longitude -12.345 to -12.34500°', () => {
      expect(DecimalFormatter.longitude(-12.345)).toBe('-12.34500°');
    });
  });

  describe('DegreesMinutesFormatter', () => {
    it("should format latitude 12.345 to 12° 20.700'", () => {
      expect(DegreesMinutesFormatter.latitude(12.345)).toBe("12° 20.700' N");
    });

    it("should format longitude -12.345 to 12° 20.700' W", () => {
      expect(DegreesMinutesFormatter.longitude(-12.345)).toBe("12° 20.700' W");
    });
  });

  describe('DegreesMinutesSecondsFormatter', () => {
    it('should format latitude 12.345 to 12° 20\' 42.0" N', () => {
      expect(DegreesMinutesSecondsFormatter.latitude(12.345)).toBe('12° 20\' 42.0" N');
    });

    it('should format longitude -12.345 to 12° 20\' 42.0" W', () => {
      expect(DegreesMinutesSecondsFormatter.longitude(-12.345)).toBe('12° 20\' 42.0" W');
    });
  });

  describe('getCoordinateFormatter', () => {
    it('Returns DecimalFormatter', () => {
      expect(CoordinateFormatter.getCoordinateFormatter('decimalDegrees')).toBe(DecimalFormatter);
    });

    it('Returns DegreesMinutesFormatter', () => {
      expect(CoordinateFormatter.getCoordinateFormatter('degreesMinutes')).toBe(
        DegreesMinutesFormatter,
      );
    });

    it('Returns DegreesMinutesSecondsFormatter', () => {
      expect(CoordinateFormatter.getCoordinateFormatter('degreesMinutesSeconds')).toBe(
        DegreesMinutesSecondsFormatter,
      );
    });

    it('Defaults to DegreesMinutesFormatter', () => {
      expect(CoordinateFormatter.getCoordinateFormatter()).toBe(DegreesMinutesFormatter);
    });

    it('Invalid format returns default', () => {
      expect(CoordinateFormatter.getCoordinateFormatter('jdskjfdskjaajksh')).toBe(
        DegreesMinutesFormatter,
      );
    });
  });
});
