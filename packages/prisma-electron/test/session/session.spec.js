import { isEquivalent } from 'session/session';

describe('session/session', () => {
  it('isEquivalent', () => {
    expect(isEquivalent({}, undefined)).toBe(false);
    const p1 = {
      a: 'a',
    };
    const p2 = {
      a: 'a',
    };
    expect(isEquivalent(p1, p2)).toBe(true);
  });
});
