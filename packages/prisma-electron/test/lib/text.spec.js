import getTruncatedString from 'lib/text';

describe('lib/text', () => {
  describe('getTruncatedString(str, length)', () => {
    it('returns the original string when string length is less than provided length', () => {
      const string = 'short string.';

      const truncated = getTruncatedString(string);

      expect(truncated).toBe(string);
    });

    it('returns the truncated string when string length is longer than provided length', () => {
      const string = 'This is longer string.';

      const truncated = getTruncatedString(string);

      expect(truncated).toBe('This is longer st...');
    });

    it('accepts overrides for length that is longer', () => {
      const string = 'This is a longer string.';

      const truncated = getTruncatedString(string, 50);

      expect(truncated).toBe('This is a longer string.');
    });

    it('accepts overrides for length that is shorter', () => {
      const string = 'short string.';

      const truncated = getTruncatedString(string, 6);

      expect(truncated).toBe('sho...');
    });

    it('breaks strings by newlines', () => {
      const string = 'A String.\nWith a newline.';

      const truncated = getTruncatedString(string);

      expect(truncated).toBe('A String.');
    });

    it('trims whitespace before inserting ellipsis', () => {
      const string = 'A String       With a newline.';

      const truncated = getTruncatedString(string, 15);

      expect(truncated).toBe('A String...');
    });

    it('returns empty string when string is undefined', () => {
      const truncated = getTruncatedString(undefined, 15);

      expect(truncated).toBe('');
    });

    it('returns empty string when string is null', () => {
      const truncated = getTruncatedString(null, 15);

      expect(truncated).toBe('');
    });
  });
});
