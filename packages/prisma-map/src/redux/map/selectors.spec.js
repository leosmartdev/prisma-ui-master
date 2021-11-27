import { point } from '@turf/turf';
import deepFreeze from 'deep-freeze';
import {
  isFeatureOnLayer,
  createStylesForAllMaps,
  getGeneratedStyleForMap,
  getStylesForLoadedMaps,
  getLayerConfig,
  getFlyToPositionForMap,
  getModeForMap,
} from './selectors';
import { runLayerFilter } from './filters';

jest.mock('./filters', () => ({
  runLayerFilter: jest.fn(() => false),
}));

describe('redux/map/selectors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStylesForAllMaps', () => {
    const state = {
      map: {
        mapIds: ['foo'],
        foo: {
          loaded: true,
          style: {
            mapId: 'foo',
            sources: {
              url: {
                type: 'geojson',
                url: 'http://foo.com',
              },
            },
            layers: [
              { id: 'layer1', source: 'url' },
            ],
          },
          layers: {
            dynamicLayers: ['layer2'],
          },
        },
      },
      layers: {
        layer2: {
          id: 'layer2',
          name: 'Layer 2',
          source: 'features',
        },
      },
    };

    it('adds features to proper layer sources', () => {
      deepFreeze(state);

      runLayerFilter.mockImplementation(() => true);
      const f1 = point([0, 1]);
      f1.properties.bar = 'baz';
      const f2 = point([1, 2]);
      f2.properties.bar = 'foo';

      const testState = {
        '@prisma/map': {
          ...state,
          layers: {
            ...state.layers,
            layer2: {
              ...state.layers.layer2,
              filter: ['featureProperty', '!=', 'bar', undefined],
            },
          },
          features: {
            f1,
            f2,
          },
        },
      };

      deepFreeze(testState);

      const generatedStyles = createStylesForAllMaps(testState);

      expect(generatedStyles).toMatchSnapshot();
    });

    it('only adds a feature to the first layer that matches', () => {
      runLayerFilter.mockImplementation((feature, filter) => filter[0]);
      const f1 = point([0, 1]);
      f1.properties.layerId = 'layer3';

      const testState = {
        '@prisma/map': {
          ...state,
          map: {
            ...state.map,
            foo: {
              ...state.map.foo,
              layers: {
                dynamicLayers: ['layer2', 'layer3', 'layer4'],
              },
              style: {
                ...state.map.foo.style,
                layers: [
                  { id: 'layer1', source: 'url' },
                ],
              },
            },
          },
          layers: {
            layer2: {
              source: 'features',
              filter: [false],
            },
            layer3: {
              source: 'features',
              filter: [true],
            },
            layer4: {
              source: 'features',
              filter: [true],
            },
          },
          features: {
            f1,
          },
        },
      };

      deepFreeze(testState);

      const generatedStyles = createStylesForAllMaps(testState);

      // expecting layer 4 to match in this case.
      expect(generatedStyles).toMatchSnapshot();
    });

    it('add features to all maps that match', () => {
      runLayerFilter.mockImplementation((feature, filter) => filter[0]);
      const f1 = point([0, 1]);
      f1.properties.layerId = 'layer3';

      const map = {
        ...state.map.foo,
        layers: {
          dynamicLayers: ['layer2', 'layer3', 'layer4', 'layer5'],
        },
        style: {
          ...state.map.foo.style,
          layers: [
            { id: 'layer1', source: 'url' },
          ],
        },
      };

      const testState = {
        '@prisma/map': {
          map: {
            mapIds: ['foo', 'bar', 'baz'],
            foo: { ...map },
            bar: {
              ...map,
              layers: {
                dynamicLayers: ['layer2', 'layer5'],
              },
              style: {
                ...state.map.foo.style,
                mapId: 'bar',
                layers: [],
              },
            },
            baz: {
              ...map,
              layers: {
                dynamicLayers: ['layer2', 'layer4'],
              },
              style: {
                ...state.map.foo.style,
                mapId: 'baz',
                layers: [],
              },
            },
          },
          layers: {
            layer2: {
              source: 'features',
              filter: [false],
            },
            layer3: {
              source: 'features',
              filter: [true],
            },
            layer4: {
              source: 'features',
              filter: [false],
            },
            layer5: {
              source: 'features',
              filter: [true],
            },
          },
          features: {
            f1,
          },
        },
      };

      deepFreeze(testState);

      const generatedStyles = createStylesForAllMaps(testState);

      expect(generatedStyles).toMatchSnapshot();
    });
  });

  describe('getStylesForLoadedMaps()', () => {
    it('only returns generated styles for loaded maps', () => {
      const testState = {
        '@prisma/map': {
          map: {
            mapIds: ['foo', 'bar', 'baz'],
            foo: {
              loaded: true,
              style: {
                mapId: 'foo',
                sources: {},
                layers: [],
              },
            },
            bar: {
              loaded: true,
              style: {
                mapId: 'bar',
                sources: {},
                layers: [],
              },
            },
            baz: {
              loaded: false,
              style: {
                mapId: 'bar',
                sources: {},
                layers: [],
              },
            },
          },
        },
      };

      deepFreeze(testState);

      const generatedStyles = getStylesForLoadedMaps(testState);

      expect(generatedStyles).toMatchSnapshot();
    });

    it('adds all sources and layers listed in dynamicLayers', () => {
      const testState = {
        '@prisma/map': {
          map: {
            mapIds: ['foo'],
            foo: {
              loaded: true,
              style: {
                mapId: 'foo',
                sources: {},
                layers: [],
              },
              layers: {
                dynamicLayers: ['layer1', 'layer2'],
                layer1: {
                  type: 'circle',
                  name: 'Layer 1',
                  source: 'features',
                },
                layer2: {
                  type: 'fill',
                  name: 'Layer 2',
                  source: 'features',
                },
              },
            },
          },
          layers: {},
        },
      };

      deepFreeze(testState);

      const generatedStyles = getStylesForLoadedMaps(testState);

      expect(generatedStyles).toMatchSnapshot();
    });

    it('adds dynamic layers after the existing ones', () => {
      const testState = {
        '@prisma/map': {
          map: {
            mapIds: ['foo'],
            foo: {
              loaded: true,
              style: {
                mapId: 'foo',
                sources: {},
                layers: [{ id: 'existing' }],
              },
              layers: {
                dynamicLayers: ['layer1', 'layer2'],
                layer1: {
                  type: 'circle',
                  name: 'Layer 1',
                  source: 'features',
                },
                layer2: {
                  type: 'fill',
                  name: 'Layer 2',
                  source: 'features',
                },
              },
            },
          },
          layers: {},
        },
      };

      deepFreeze(testState);

      const generatedStyles = getStylesForLoadedMaps(testState);

      expect(generatedStyles).toEqual(expect.objectContaining({
        foo: {
          mapId: 'foo',
          layers: [
            { id: 'existing' },
            {
              id: 'layer1',
              type: 'circle',
              source: 'generated:layer1',
            }, {
              id: 'layer2',
              type: 'fill',
              source: 'generated:layer2',
            },
          ],
          sources: expect.any(Object),
        },
      }));
    });

    it('doesnt add layers not listed in dynamicLayers ', () => {
      const testState = {
        '@prisma/map': {
          map: {
            mapIds: ['foo'],
            foo: {
              loaded: true,
              style: {
                mapId: 'foo',
                sources: {},
                layers: [],
              },
              layers: {
                dynamicLayers: ['layer2'],
                layer1: {
                  type: 'circle',
                  name: 'Layer 1',
                  source: 'features',
                },
                layer2: {
                  type: 'fill',
                  name: 'Layer 2',
                  source: 'features',
                  paint: {
                    'circle-color': '#FFFFFF',
                  },
                  layout: {
                    visibility: 'none',
                  },
                },
              },
            },
          },
          layers: {},
        },
      };

      deepFreeze(testState);

      const generatedStyles = getStylesForLoadedMaps(testState);

      expect(generatedStyles).toEqual(expect.objectContaining({
        foo: {
          mapId: 'foo',
          layers: [{
            id: 'layer2',
            type: 'fill',
            source: 'generated:layer2',
            paint: {
              'circle-color': '#FFFFFF',
            },
            layout: {
              visibility: 'none',
            },
          }],
          sources: expect.any(Object),
        },
      }));
    });
  });

  describe('getLayerConfig()', () => {
    it('returns global layer config', () => {
      const state = {
        '@prisma/map': {
          map: {
            bar: {
              layers: {},
            },
          },
          layers: {
            foo: {
              id: 'foo',
              source: 'historicalFeatures',
              type: 'circle',
              filter: ['featureType', 'Point'],
              layout: { visibility: 'visible' },
              paint: { 'circle-color': '#00FF00' },
            },
          },
        },
      };
      deepFreeze(state);

      const layerConfig = getLayerConfig(state, 'bar', 'foo');

      expect(layerConfig).toEqual({
        id: 'foo',
        source: 'historicalFeatures',
        type: 'circle',
        filter: ['featureType', 'Point'],
        layout: { visibility: 'visible' },
        paint: { 'circle-color': '#00FF00' },
      });
    });

    it('returns map layer config', () => {
      const state = {
        '@prisma/map': {
          map: {
            bar: {
              layers: {
                foo: {
                  id: 'foo',
                  source: 'historicalFeatures',
                  type: 'circle',
                  filter: ['featureType', 'Point'],
                  layout: { visibility: 'visible' },
                  paint: { 'circle-color': '#00FF00' },
                },
              },
            },
          },
          layers: {},
        },
      };
      deepFreeze(state);

      const layerConfig = getLayerConfig(state, 'bar', 'foo');

      expect(layerConfig).toEqual({
        id: 'foo',
        source: 'historicalFeatures',
        type: 'circle',
        filter: ['featureType', 'Point'],
        layout: { visibility: 'visible' },
        paint: { 'circle-color': '#00FF00' },
      });
    });

    it('returns style ready config when passed styleLayer=true', () => {
      const state = {
        '@prisma/map': {
          map: {
            bar: {
              layers: {
                foo: {
                  id: 'foo',
                  source: 'historicalFeatures',
                  type: 'circle',
                  filter: ['featureType', 'Point'],
                  layout: { visibility: 'visible' },
                  paint: { 'circle-color': '#00FF00' },
                  other: 'properties',
                },
              },
            },
          },
          layers: {},
        },
      };
      deepFreeze(state);

      const layerConfig = getLayerConfig(state, 'bar', 'foo', true);

      expect(layerConfig).toEqual({
        id: 'foo',
        source: 'generated:foo',
        type: 'circle',
        layout: { visibility: 'visible' },
        paint: { 'circle-color': '#00FF00' },
      });
    });

    it('merges global with map config', () => {
      const state = {
        '@prisma/map': {
          map: {
            bar: {
              layers: {
                foo: {
                  id: 'foo',
                  layout: { visibility: 'visible' },
                },
              },
            },
          },
          layers: {
            foo: {
              id: 'foo',
              type: 'circle',
              filter: ['featureType', 'Point'],
              paint: { 'circle-color': '#00FF00' },
            },
          },
        },
      };
      deepFreeze(state);

      const layerConfig = getLayerConfig(state, 'bar', 'foo', true);

      expect(layerConfig).toEqual({
        id: 'foo',
        source: 'generated:foo',
        type: 'circle',
        layout: { visibility: 'visible' },
        paint: { 'circle-color': '#00FF00' },
      });
    });

    it('returns config with map config overriding global config styleLayer = true', () => {
      const state = {
        '@prisma/map': {
          map: {
            bar: {
              layers: {
                foo: {
                  id: 'foo',
                  paint: { 'circle-color': '#000000' },
                  layout: { visibility: 'visible' },
                },
              },
            },
          },
          layers: {
            foo: {
              id: 'foo',
              type: 'circle',
              filter: ['featureType', 'Point'],
              paint: { 'circle-color': '#00FF00' },
              layout: { visibility: 'none' },
            },
          },
        },
      };
      deepFreeze(state);

      const layerConfig = getLayerConfig(state, 'bar', 'foo', true);

      expect(layerConfig).toEqual({
        id: 'foo',
        source: 'generated:foo',
        type: 'circle',
        layout: { visibility: 'visible' },
        paint: { 'circle-color': '#000000' },
      });
    });

    it('returns config with map config overriding global config styleLayer = false', () => {
      const state = {
        '@prisma/map': {
          map: {
            bar: {
              layers: {
                foo: {
                  id: 'foo',
                  layout: { visibility: 'visible' },
                  filter: ['featureProperty', '==', 'bar', 'foo'],
                },
              },
            },
          },
          layers: {
            foo: {
              id: 'foo',
              source: 'features',
              type: 'circle',
              filter: ['featureType', 'Point'],
              paint: { 'circle-color': '#00FF00' },
              layout: { visibility: 'none' },
            },
          },
        },
      };
      deepFreeze(state);

      const layerConfig = getLayerConfig(state, 'bar', 'foo');

      expect(layerConfig).toEqual({
        id: 'foo',
        type: 'circle',
        source: 'features',
        layout: { visibility: 'visible' },
        paint: { 'circle-color': '#00FF00' },
        filter: ['featureProperty', '==', 'bar', 'foo'],
      });
    });
  });

  describe('isFeatureOnLayer()', () => {
    describe('layer.features', () => {
      it('returns true if the feature id is in the layers features prop', () => {
        const feature = { id: 'foo' };
        const layer = {
          id: 'layer1',
          features: ['foo'],
        };

        expect(isFeatureOnLayer(feature, layer)).toBe(true);
      });

      it('returns false if the feature id is not the layers features prop', () => {
        const feature = { id: 'foo' };
        const layer = {
          id: 'layer1',
          features: ['bar'],
        };

        expect(isFeatureOnLayer(feature, layer)).toBe(false);
      });

      it('returns false if there are no features or filter', () => {
        const feature = { id: 'foo' };
        const layer = {
          id: 'layer1',
        };

        expect(isFeatureOnLayer(feature, layer)).toBe(false);
      });
    });

    describe('layer.filter', () => {
      it('calls filter.featureProperty when featureProperty filter is found', () => {
        const feature = point([0, 0]);
        const layer = { id: 'layer', filter: [] };

        isFeatureOnLayer(feature, layer);

        expect(runLayerFilter).toHaveBeenCalledWith(feature, layer.filter);
      });

      it('doesnt call filter.featureProperty when featureProperty filter is not found', () => {
        const feature = point([0, 0]);
        const layer = { id: 'layer' };

        isFeatureOnLayer(feature, layer);

        expect(runLayerFilter).not.toHaveBeenCalled();
      });

      it('returns false if the layer doesnt exist', () => {
        expect(isFeatureOnLayer({ id: 'foo' }, undefined)).toBe(false);
      });
    });
  });

  describe('getGeneratedStyleForMap()', () => {
    it('returns generated style when map and style exist', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: ['map1'],
            map1: {
              generatedStyle: {
                foo: 'bar',
              },
            },
          },
        },
      };

      const style = getGeneratedStyleForMap(state, 'map1');

      expect(style).toEqual({ foo: 'bar' });
    });

    it('returns undefined when map does not exist', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: [],
          },
        },
      };

      const style = getGeneratedStyleForMap(state, 'map1');

      expect(style).toBeUndefined();
    });

    it('returns undefined when style doesnt exist on map', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: ['map1'],
            map1: {},
          },
        },
      };

      const style = getGeneratedStyleForMap(state, 'map1');

      expect(style).toBeUndefined();
    });

    it('returns undefined when mapId wasnt passed', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: ['map1'],
            map1: {},
          },
        },
      };

      const style = getGeneratedStyleForMap(state);

      expect(style).toBeUndefined();
    });
  });

  describe('getFlyToPositionForMap()', () => {
    it('returns center position when map and flyTo exist', () => {
      const state = {
        '@prisma/map': {
          map: {
            map1: {
              flyTo: {
                latitude: 36,
                longitude: -77,
              },
            },
          },
        },
      };

      const center = getFlyToPositionForMap(state, 'map1');

      expect(center).toEqual({ latitude: 36, longitude: -77 });
    });

    it('returns empty object when map does not exist', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: [],
          },
        },
      };

      const center = getFlyToPositionForMap(state, 'map1');

      expect(center).toEqual({});
    });

    it('returns empty object when flyTo doesnt exist on map', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: ['map1'],
            map1: {},
          },
        },
      };

      const center = getFlyToPositionForMap(state, 'map1');

      expect(center).toEqual({});
    });

    it('returns empty object when mapId wasnt passed', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: ['map1'],
            map1: {},
          },
        },
      };

      const center = getFlyToPositionForMap(state, 'map1');

      expect(center).toEqual({});
    });
  });

  describe('getMapModeForMap(mapId)', () => {
    it('returns mode when map exists', () => {
      const state = {
        '@prisma/map': {
          map: {
            map1: {
              mode: 'draw',
            },
          },
        },
      };

      const mode = getModeForMap(state, 'map1');

      expect(mode).toEqual('draw');
    });

    it('returns null when map does not exist', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: [],
          },
        },
      };

      const mode = getModeForMap(state, 'map1');

      expect(mode).toBeNull();
    });

    it('returns normal when mode doesnt exist on map', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: ['map1'],
            map1: {},
          },
        },
      };

      const mode = getModeForMap(state, 'map1');

      expect(mode).toEqual('normal');
    });

    it('returns null when mapId wasnt passed', () => {
      const state = {
        '@prisma/map': {
          map: {
            mapIds: ['map1'],
            map1: {},
          },
        },
      };

      const mode = getModeForMap(state);

      expect(mode).toBeNull();
    });
  });
});
