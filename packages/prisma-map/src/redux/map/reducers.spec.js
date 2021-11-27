import deepFreeze from 'deep-freeze';
import {
  setMapStyle,
  setGeneratedMapStyle,
  createMap,
  setMapLoaded,
  mapWillUnload,
  setLayerVisibility,
  flyTo,
  setMapMode,
} from './actions';
import {
  setMapStyleReducer,
  setGeneratedMapStyleReducer,
  createMapReducer,
  setMapLoadedReducer,
  setMapUnloadedReducer,
  setLayerVisibilityReducer,
  flyToReducer,
  setMapModeReducer,
} from './reducers';

describe('redux/map/reducers', () => {
  describe('createMapReducer()', () => {
    it('creates a new map object in state', () => {
      const config = {
        id: 'map1', // required
        style: 'mapbox://url.to.map.or.config.object',
      };
      const state = {
        mapIds: [],
      };
      const action = createMap(config);
      deepFreeze(state);

      const newState = createMapReducer(state, action);

      expect(newState).toEqual({
        mapIds: ['map1'],
        map1: {
          id: 'map1',
          loaded: false,
          mode: 'normal',
          flyTo: null,
          style: 'mapbox://url.to.map.or.config.object',
          generatedStyle: null,
          layers: {
            dynamicLayers: [],
            toggleableLayers: [],
          },
        },
      });
    });

    it('ignores maps with no id', () => {
      const state = { mapIds: [] };
      const action = createMap({});
      deepFreeze(state);

      const newState = createMapReducer(state, action);

      expect(newState).toBe(state);
    });

    it('ignores creation if map already exists', () => {
      const state = { mapIds: ['map1'], map1: {} };
      const action = createMap({ id: 'map1', style: 'mapbox://style' });
      deepFreeze(state);

      const newState = createMapReducer(state, action);

      expect(newState).toBe(state);
    });

    it('does not override existing dynamic layers config', () => {
      const config = {
        id: 'map1', // required
        style: 'mapbox://url.to.map.or.config.object',
        layers: {
          dynamicLayers: ['foo'],
          toggleableLayers: ['foo'],
          foo: {
            id: 'foo',
          },
        },
      };
      const state = {
        mapIds: [],
      };
      const action = createMap(config);
      deepFreeze(state);

      const newState = createMapReducer(state, action);

      expect(newState).toEqual({
        mapIds: ['map1'],
        map1: {
          id: 'map1',
          loaded: false,
          mode: 'normal',
          flyTo: null,
          style: 'mapbox://url.to.map.or.config.object',
          layers: {
            dynamicLayers: ['foo'],
            toggleableLayers: ['foo'],
            foo: {
              id: 'foo',
            },
          },
          generatedStyle: null,
        },
      });
    });
  });

  describe('setMapLoadedReducer()', () => {
    it('sets loaded flag on the map object', () => {
      const action = setMapLoaded('map1');
      const state = {
        map1: {
          loaded: false,
        },
      };
      deepFreeze(state);

      const newState = setMapLoadedReducer(state, action);

      expect(newState).toEqual({
        map1: {
          loaded: true,
        },
      });
    });

    it('leaves other map objects alone', () => {
      const action = setMapLoaded('map1');
      const state = {
        map1: {
          loaded: false,
        },
        map2: {
          loaded: false,
        },
      };
      deepFreeze(state);

      const newState = setMapLoadedReducer(state, action);

      expect(newState).toEqual({
        map1: {
          loaded: true,
        },
        map2: {
          loaded: false,
        },
      });
    });

    it('returns original state when mapId isnt found', () => {
      const action = setMapLoaded('map1');
      const state = {
        map2: {
          loaded: false,
        },
      };
      deepFreeze(state);

      const newState = setMapLoadedReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('setMapUnloadedReducer()', () => {
    it('sets loaded flag on the map object', () => {
      const action = mapWillUnload('map1');
      const state = {
        map1: {
          loaded: true,
        },
      };
      deepFreeze(state);

      const newState = setMapUnloadedReducer(state, action);

      expect(newState).toEqual({
        map1: {
          loaded: false,
        },
      });
    });

    it('leaves other map objects alone', () => {
      const action = mapWillUnload('map1');
      const state = {
        map1: {
          loaded: true,
        },
        map2: {
          loaded: true,
        },
      };
      deepFreeze(state);

      const newState = setMapUnloadedReducer(state, action);

      expect(newState).toEqual({
        map1: {
          loaded: false,
        },
        map2: {
          loaded: true,
        },
      });
    });

    it('returns original state when mapId isnt found', () => {
      const action = mapWillUnload('map1');
      const state = {
        map2: {
          loaded: true,
        },
      };
      deepFreeze(state);

      const newState = setMapUnloadedReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('setMapStyleReducer()', () => {
    it('sets the style for the mapId', () => {
      const state = {
        mapIds: ['map1'],
        map1: {
          style: {},
        },
      };
      const style = {
        mapId: 'map1',
        name: 'dark',
        layers: [],
        sources: [],
        version: 8,
      };
      const action = setMapStyle('map1', style);
      deepFreeze(state);

      const newState = setMapStyleReducer(state, action);

      expect(newState).toEqual({
        mapIds: ['map1'],
        map1: {
          style: {
            mapId: 'map1',
            name: 'dark',
            layers: [],
            sources: [],
            version: 8,
          },
        },
      });
    });

    it('only sets map style', () => {
      const state = {
        mapIds: ['map1'],
        map1: {
          style: {},
          toggleableLayers: ['foo', 'bar'],
        },
      };
      const style = {
        mapId: 'map1',
        name: 'dark',
        layers: [],
        sources: [],
        version: 8,
      };
      const action = setMapStyle('map1', style);
      deepFreeze(state);

      const newState = setMapStyleReducer(state, action);

      expect(newState).toEqual({
        mapIds: ['map1'],
        map1: {
          style: {
            mapId: 'map1',
            name: 'dark',
            layers: [],
            sources: [],
            version: 8,
          },
          toggleableLayers: ['foo', 'bar'],
        },
      });
    });

    it('does nothing when map does not already exist', () => {
      const state = {
        mapIds: [],
      };
      const style = {
        mapId: 'map1',
        name: 'dark',
        layers: [],
        sources: [],
        version: 8,
      };
      const action = setMapStyle('map1', style);
      deepFreeze(state);

      const newState = setMapStyleReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('setGeneratedMapStyleReducer()', () => {
    it('sets the style for the mapId', () => {
      const state = {
        mapIds: ['map1'],
        map1: {
          generatedStyle: {},
        },
      };
      const style = {
        mapId: 'map1',
        name: 'dark',
        layers: [],
        sources: [],
        version: 8,
      };
      const action = setGeneratedMapStyle('map1', style);
      deepFreeze(state);

      const newState = setGeneratedMapStyleReducer(state, action);

      expect(newState).toEqual({
        mapIds: ['map1'],
        map1: {
          generatedStyle: {
            mapId: 'map1',
            name: 'dark',
            layers: [],
            sources: [],
            version: 8,
          },
        },
      });
    });

    it('only sets map style', () => {
      const state = {
        mapIds: ['map1'],
        map1: {
          style: {},
          generatedStyle: {},
          toggleableLayers: ['foo', 'bar'],
        },
      };
      const style = {
        mapId: 'map1',
        name: 'dark',
        layers: [],
        sources: [],
        version: 8,
      };
      const action = setGeneratedMapStyle('map1', style);
      deepFreeze(state);

      const newState = setGeneratedMapStyleReducer(state, action);

      expect(newState).toEqual({
        mapIds: ['map1'],
        map1: {
          style: {},
          generatedStyle: {
            mapId: 'map1',
            name: 'dark',
            layers: [],
            sources: [],
            version: 8,
          },
          toggleableLayers: ['foo', 'bar'],
        },
      });
    });

    it('does nothing when map does not already exist', () => {
      const state = {
        mapIds: [],
      };
      const style = {
        mapId: 'map1',
        name: 'dark',
        layers: [],
        sources: [],
        version: 8,
      };
      const action = setGeneratedMapStyle('map1', style);
      deepFreeze(state);

      const newState = setGeneratedMapStyleReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('setLayerVisibility(isVisible=true)', () => {
    it('sets visibility on layerId provided', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map1: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map1: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      });
    });

    it('sets visibility on layerId provided when it is not dynamic but on original style', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map1: {
          style: {
            layers: [
              { id: 'layer1', layout: { visibility: 'none' } },
            ],
          },
          layers: {
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map1: {
          style: {
            layers: [
              { id: 'layer1', layout: { visibility: 'visible' } },
            ],
          },
          layers: {
          },
        },
      });
    });

    it('sets visibility on correct layer when map has multiple layers', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'none' } },
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'none' } },
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      });
    });

    it('sets visibility on right map when there are multiples', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map2: {
          layers: {
            layer3: { id: 'layer3', layout: { visibility: 'none' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'none' } },
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map2: {
          layers: {
            layer3: { id: 'layer3', layout: { visibility: 'none' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'none' } },
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      });
    });

    it('sets visibility on right map when there are multiples with same layer id', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map2: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'none' } },
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map2: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'none' } },
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      });
    });

    it('returns original state when layerId can not be found', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map1: {
          layers: {},
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual(state);
    });

    it('returns original state when layerId can not be found on original style layers', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map1: {
          style: {
            layers: [
              { id: 'notLayer1' },
            ],
          },
          layers: {},
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual(state);
    });

    it('returns original state when layerId can not be found but is in dynamic layers', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map1: {
          layers: {
            dynamicLayers: ['layer1'],
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map1: {
          layers: {
            dynamicLayers: ['layer1'],
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      });
    });

    it('returns original state when mapId can not be found', () => {
      const action = setLayerVisibility('map1', 'layer1', true);
      const state = {
        map2: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('setLayerVisibility(isVisible=false)', () => {
    it('sets visibility on layerId provided', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map1: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map1: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      });
    });

    it('sets visibility on layerId provided when it is not dynamic but on original style', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map1: {
          style: {
            layers: [
              { id: 'layer1', layout: { visibility: 'visible' } },
            ],
          },
          layers: {
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map1: {
          style: {
            layers: [
              { id: 'layer1', layout: { visibility: 'none' } },
            ],
          },
          layers: {
          },
        },
      });
    });

    it('sets visibility on correct layer when map has multiple layers', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'visible' } },
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'visible' } },
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      });
    });

    it('sets visibility on right map when there are multiples', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map2: {
          layers: {
            layer3: { id: 'layer3', layout: { visibility: 'visible' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'visible' } },
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map2: {
          layers: {
            layer3: { id: 'layer3', layout: { visibility: 'visible' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'visible' } },
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      });
    });

    it('sets visibility on right map when there are multiples with same layer id', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map2: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'visible' } },
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual({
        map2: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
        map1: {
          layers: {
            layer2: { id: 'layer2', layout: { visibility: 'visible' } },
            layer1: { id: 'layer1', layout: { visibility: 'none' } },
          },
        },
      });
    });

    it('returns original state when layerId can not be found', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map1: {
          layers: {},
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual(state);
    });

    it('returns original state when layerId can not be found on original style layers', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map1: {
          style: {
            layers: [
              { id: 'notLayer1' },
            ],
          },
          layers: {},
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toEqual(state);
    });


    it('returns original state when mapId can not be found', () => {
      const action = setLayerVisibility('map1', 'layer1', false);
      const state = {
        map2: {
          layers: {
            layer1: { id: 'layer1', layout: { visibility: 'visible' } },
          },
        },
      };
      deepFreeze(state);

      const newState = setLayerVisibilityReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('flyTo()', () => {
    it('sets lat/lng in store on flyTo', () => {
      const action = flyTo('foo', { latitude: 37, longitude: -77 });
      const state = {
        foo: {
          flyTo: undefined,
        },
      };
      deepFreeze(state);

      const newState = flyToReducer(state, action);

      expect(newState).toEqual({
        foo: {
          flyTo: {
            latitude: 37,
            longitude: -77,
          },
        },
      });
    });

    it('doesnt modify when mapId isnt valid', () => {
      const action = flyTo('foo', { latitude: 37, longitude: -77 });
      const state = {
        bar: {
          flyTo: undefined,
        },
      };
      deepFreeze(state);

      const newState = flyToReducer(state, action);

      expect(newState).toBe(state);
    });

    it('doesnt add extra parameters to center', () => {
      const action = flyTo('foo', { latitude: 37, longitude: -77, foo: 'bar' });
      const state = {
        foo: {
          flyTo: undefined,
        },
      };
      deepFreeze(state);

      const newState = flyToReducer(state, action);

      expect(newState).toEqual({
        foo: {
          flyTo: {
            latitude: 37,
            longitude: -77,
          },
        },
      });
    });

    it('doesnt modify when center isnt valid', () => {
      const action = flyTo('foo', { foo: 37, bar: -77 });
      const state = {
        foo: {
          flyTo: undefined,
        },
      };
      deepFreeze(state);

      const newState = flyToReducer(state, action);

      expect(newState).toBe(state);
    });

    it('doesnt modify when center values are null', () => {
      const action = flyTo('foo', { latitude: null, longitude: null });
      const state = {
        foo: {
          flyTo: undefined,
        },
      };
      deepFreeze(state);

      const newState = flyToReducer(state, action);

      expect(newState).toBe(state);
    });

    it('doesnt modify when latitude value is out of bound', () => {
      const action = flyTo('foo', { latitude: 100, longitude: -77 });
      const state = {
        foo: {
          flyTo: undefined,
        },
      };
      deepFreeze(state);

      const newState = flyToReducer(state, action);

      expect(newState).toBe(state);
    });

    it('doesnt modify when longitude value is out of bound', () => {
      const action = flyTo('foo', { latitude: 37, longitude: 360 });
      const state = {
        foo: {
          flyTo: undefined,
        },
      };
      deepFreeze(state);

      const newState = flyToReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('setMapModeReducer', () => {
    it('sets mode for the map', () => {
      const action = setMapMode('map1', 'draw');
      const state = {
        map1: {
          mode: 'normal',
        },
      };

      const newState = setMapModeReducer(state, action);

      expect(newState).toEqual({
        map1: {
          mode: 'draw',
        },
      });
    });

    it('returns original state if map id doesnt exist', () => {
      const action = setMapMode('map1', 'draw');
      const state = {
        map2: {
          mode: 'normal',
        },
      };

      const newState = setMapModeReducer(state, action);

      expect(newState).toBe(state);
    });
  });
});
