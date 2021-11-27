import Map from './Map';
import StaticMap from './StaticMap';
import { Map as MapDefault, StaticMap as StaticMapIndex } from './';

describe('index.js exports', () => {
  it('imports Map from index.js same as direct import', () => {
    expect(Map).toBe(MapDefault);
  });

  it('imports StaticMap from index.js same as direct import', () => {
    expect(StaticMap).toBe(StaticMapIndex);
  });
});
