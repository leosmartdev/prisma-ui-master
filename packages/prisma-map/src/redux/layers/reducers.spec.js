import addLayer from './actions';
import { addLayerReducer } from './reducers';

describe('redux/layers/reducers', () => {
  describe('addLayers()', () => {
    it('adds a single layer to the state', () => {
      const action = addLayer({ id: 'layer1', filter: [] });
      const state = {};

      const newState = addLayerReducer(state, action);

      expect(newState).toEqual({
        layer1: {
          id: 'layer1',
          filter: [],
        },
      });
    });

    it('overwrites layer that already exists with matching id', () => {
      const action = addLayer({ id: 'layer1', filter: [] });
      const state = {
        layer1: {
          filter: ['foo', 'bar'],
        },
      };

      const newState = addLayerReducer(state, action);

      expect(newState).toEqual({
        layer1: {
          id: 'layer1',
          filter: [],
        },
      });
    });

    it('doesnt overwrite existing layers with different ids', () => {
      const action = addLayer({ id: 'layer1', filter: [] });
      const state = {
        layer2: {
          id: 'layer2',
          filter: ['foo', 'bar'],
        },
      };

      const newState = addLayerReducer(state, action);

      expect(newState).toEqual({
        layer1: {
          id: 'layer1',
          filter: [],
        },
        layer2: {
          id: 'layer2',
          filter: ['foo', 'bar'],
        },
      });
    });
  });
});
