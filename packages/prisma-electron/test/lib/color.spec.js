import * as Color from 'lib/color';

describe('lib/color', () => {
  it('should convert an object to a string value', () => {
    const color = {
      r: 10, g: 20, b: 30, a: 0.5,
    };
    expect(Color.toString(color)).toBe('rgba(10, 20, 30, 0.5)');
  });

  it('should pass through a value that is already a string', () => {
    expect(Color.toString('a')).toBe('a');
  });
});
