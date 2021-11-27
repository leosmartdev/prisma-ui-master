import { expand, walk, hashObject } from '../../src/lib/object';

describe('lib/object', () => {
  it('should expand a single attribute', () => {
    const result = expand({ foo: 1 });
    const expected = { foo: 1 };
    expect(result).toEqual(expected);
  });

  it('should expand deep attributes', () => {
    const result = expand({ 'foo.bar.baz': 1 });
    const expected = { foo: { bar: { baz: 1 } } };
    expect(result).toEqual(expected);
  });

  it('should expand multiple attributes', () => {
    const result = expand({
      'colors.blue': '#00f',
      'colors.red': '#f00',
      'coins.penny': 1,
      'coins.nickel': 5,
    });
    const expected = {
      colors: {
        blue: '#00f',
        red: '#f00',
      },
      coins: {
        penny: 1,
        nickel: 5,
      },
    };
    expect(result).toEqual(expected);
  });

  it('should walk a single attribute', () => {
    const result = walk('foo', { foo: 1 });
    expect(result).toBe(1);
  });

  it('should walk a multiple attributes', () => {
    const result = walk('foo.bar.baz', { foo: { bar: { baz: 1 } } });
    expect(result).toBe(1);
  });

  it('should return undefined when ending a walk early', () => {
    const result = walk('foo.bar.baz', { foo: 1 });
    expect(result).toBeUndefined();
  });

  it('should return undefined when a value is null', () => {
    const result = walk('foo.bar.baz', { foo: { bar: { baz: null } } });
    expect(result).toBeUndefined();
  });

  describe('hashObject()', () => {
    it('Should return null for a null object', () => {
      expect(hashObject(null)).toBeNull();
    });

    it('Should return null for an undefined object', () => {
      expect(hashObject()).toBeNull();
    });

    it('Should return correct hash for object', () => {
      const obj = { id: 'ID' };
      expect(hashObject(obj)).toBe('d0182ef6a2d3a949f0463820ae598646');
    });

    it('Should return correct hash for object with nested values', () => {
      const obj = { id: 'ID', sub: { key: 'value', arry: [1, 2, 3, 4] } };
      expect(hashObject(obj)).toBe('1fac05e6d13bffc99ff783bf3a32ab1d');
    });
  });
});
