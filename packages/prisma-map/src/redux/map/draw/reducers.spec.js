import deepFreeze from 'deep-freeze';
import {
  changeDrawToolReducer,
  addFeatureToDrawReducer,
} from './reducers';
import {
  changeDrawTool,
  addInputFeatureToDraw,
  setOutputFeatureFromDraw,
} from './actions';

describe('redux/draw/reducers', () => {
  describe('changeDrawToolReducer', () => {
    it('Changes the draw tool to the provided tool', () => {
      const action = changeDrawTool('map1', 'line');
      const state = {
        map1: {
          draw: {
            tool: 'select',
          },
        },
      };
      deepFreeze(state);
      const newState = changeDrawToolReducer(state, action);

      expect(newState).toEqual({
        map1: {
          draw: {
            tool: 'line',
            featureIn: null,
            featureOut: null,
          },
        },
      });
    });

    it('Returns original state when mapId doesnt exist', () => {
      const action = changeDrawTool('map1', 'line');
      const state = {
        map2: {
          draw: {
            tool: 'select',
            featureIn: null,
            featureOut: null,
          },
        },
      };
      deepFreeze(state);
      const newState = changeDrawToolReducer(state, action);

      expect(newState).toBe(state);
    });
  });

  describe('addInputFeatureToDrawReducer', () => {
    it('Adds in feature to the reducer', () => {
      const feature = { type: 'Feature', geometry: {}, properties: {} };
      const action = addInputFeatureToDraw('map1', feature);
      const state = {
        map1: {
          draw: {
            tool: 'polygon',
            featureIn: null,
            featureOut: null,
          },
        },
      };
      deepFreeze(state);

      const newState = addFeatureToDrawReducer(state, action);

      expect(newState).toEqual({
        map1: {
          draw: {
            tool: 'polygon',
            featureIn: feature,
            featureOut: feature,
          },
        },
      });
    });

    it('Adds out feature to the reducer', () => {
      const feature = { type: 'Feature', geometry: {}, properties: {} };
      const action = setOutputFeatureFromDraw('map1', feature);
      const state = {
        map1: {
          draw: {
            tool: 'polygon',
            featureIn: null,
            featureOut: null,
          },
        },
      };
      deepFreeze(state);

      const newState = addFeatureToDrawReducer(state, action);

      expect(newState).toEqual({
        map1: {
          draw: {
            tool: 'polygon',
            featureIn: null,
            featureOut: feature,
          },
        },
      });
    });
  });
});
