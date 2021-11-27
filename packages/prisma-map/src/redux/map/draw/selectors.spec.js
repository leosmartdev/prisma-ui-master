import { getDrawToolForMap, getInputDrawFeatureForMap, getOutputDrawFeatureForMap } from './selectors';

describe('redux/map/draw/selectors', () => {
  describe('getDrawToolForMap()', () => {
    it('returns draw tool for map', () => {
      const state = {
        '@prisma/map': {
          map: {
            map1: {
              draw: {
                tool: 'line',
              },
            },
          },
        },
      };

      expect(getDrawToolForMap(state, 'map1')).toEqual('line');
    });

    it('returns null when map doesnt exist', () => {
      const state = { '@prisma/map': { map: {} } };

      expect(getDrawToolForMap(state, 'map1')).toBeNull();
    });

    it('returns null when map.draw doesnt exist', () => {
      const state = { '@prisma/map': { map: { map1: {} } } };

      expect(getDrawToolForMap(state, 'map1')).toBeNull();
    });

    it('returns select when map.draw exists, but tool is not set', () => {
      const state = { '@prisma/map': { map: { map1: { draw: {} } } } };

      expect(getDrawToolForMap(state, 'map1')).toEqual('select');
    });
  });

  describe('getDrawInputFeatureForMap()', () => {
    it('returns feature for map', () => {
      const state = {
        '@prisma/map': {
          map: {
            map1: {
              draw: {
                featureIn: { id: 'foo' },
              },
            },
          },
        },
      };

      expect(getInputDrawFeatureForMap(state, 'map1')).toEqual({ id: 'foo' });
    });

    it('returns null when map doesnt exist', () => {
      const state = { '@prisma/map': { map: {} } };

      expect(getInputDrawFeatureForMap(state, 'map1')).toBeNull();
    });

    it('returns null when map.draw doesnt exist', () => {
      const state = { '@prisma/map': { map: { map1: {} } } };

      expect(getInputDrawFeatureForMap(state, 'map1')).toBeNull();
    });

    it('returns select when map.draw exists, but tool is not set', () => {
      const state = { '@prisma/map': { map: { map1: { draw: {} } } } };

      expect(getInputDrawFeatureForMap(state, 'map1')).toBeNull();
    });
  });

  describe('getOutputDrawFeatureForMap()', () => {
    it('returns feature for map', () => {
      const state = {
        '@prisma/map': {
          map: {
            map1: {
              draw: {
                featureOut: { id: 'foo' },
              },
            },
          },
        },
      };

      expect(getOutputDrawFeatureForMap(state, 'map1')).toEqual({ id: 'foo' });
    });

    it('returns null when map doesnt exist', () => {
      const state = { '@prisma/map': { map: {} } };

      expect(getOutputDrawFeatureForMap(state, 'map1')).toBeNull();
    });

    it('returns null when map.draw doesnt exist', () => {
      const state = { '@prisma/map': { map: { map1: {} } } };

      expect(getOutputDrawFeatureForMap(state, 'map1')).toBeNull();
    });

    it('returns select when map.draw exists, but tool is not set', () => {
      const state = { '@prisma/map': { map: { map1: { draw: {} } } } };

      expect(getOutputDrawFeatureForMap(state, 'map1')).toBeNull();
    });
  });
});
