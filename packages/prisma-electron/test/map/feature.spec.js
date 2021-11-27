import { mockStore } from '../common';
import * as features from 'map/features';

describe('map/features', () => {
  describe('[thunk] getFeature', () => {
    let mockServer = null;
    let defaultState = {};

    const empty = {
      map_feature: {
        features: [],
      },
    };

    beforeEach(() => {
      mockServer = jest.fn().mockImplementation(() => {
        return {};
      });
      defaultState = {
        server: mockServer,
        ...empty,
      };
    });

    it('calls server.get with correct arguments', () => {
      const store = mockStore(defaultState);

      mockServer.get = jest.fn(() => Promise.resolve());

      return store.dispatch(features.getFeature('ID', 'registry')).then(() => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/registry/ID');
      });
    });

    it('on get success returns data and calls success action', () => {
      const feature = { id: 'ID', registryId: 'ID' };
      const store = mockStore(defaultState);
      mockServer.get = jest.fn(() => Promise.resolve(feature));

      return store.dispatch(features.getFeature('ID', 'registry')).then(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/registry/ID');

        expect(response).toEqual(feature);

        const actions = store.getActions();
        expect(actions.length).toBe(1);
        expect(actions[0]).toMatchObject({ type: 'map/features/get:success', payload: feature });
      });
    });

    it('on get failure returns failed response in promise', () => {
      const error = { ok: false, data: null };
      const store = mockStore(defaultState);
      mockServer.get = jest.fn(() => Promise.reject(error));

      return store.dispatch(features.getFeature('ID', 'registry')).catch(response => {
        expect(mockServer.get).toHaveBeenCalledTimes(1);
        expect(mockServer.get).toHaveBeenCalledWith('/registry/ID');

        expect(response).toEqual(error);

        const actions = store.getActions();
        expect(actions.length).toBe(0);
      });
    });
  });

  describe('[reducer] map/features', () => {
    const empty = {
      features: [],
    };

    it('has correct default state', () => {
      const newState = features.reducer(undefined, { type: 'DEFAULT_STATE' });
      expect(newState).toEqual({
        features: [],
      });
    });

    it('Adds the feature to the state on success', () => {
      const feature = { id: 'TEST', registryId: 'TEST' };
      const newState = features.reducer(empty, features.getFeatureSuccess(feature));

      expect(newState.features.length).toBe(1);
      expect(newState.features[0]).toBe(feature);
    });

    it('Adds the feature to the end of the list on success', () => {
      const feature = { id: 'TEST', registryId: 'TEST' };
      const newState = features.reducer(
        {
          ...empty,
          features: [{ id: 'TEST_ORIG', databaseId: 'TEST_ORIG' }],
        },
        features.getFeatureSuccess(feature),
      );

      expect(newState.features.length).toBe(2);
      expect(newState.features[1]).toBe(feature);
    });

    it('Replaces existing feature with the same ID', () => {
      const feature = { id: 'TEST', registryId: 'TEST' };
      const newState = features.reducer(
        {
          ...empty,
          features: [
            { id: 'TEST_ORIG', databaseId: 'TEST_ORIG' },
            { id: 'TEST', registryId: 'TEST' },
            { id: 'TEST_ORIG2', registryId: 'TEST_ORIG2' },
          ],
        },
        features.getFeatureSuccess(feature),
      );

      expect(newState.features.length).toBe(3);
      expect(newState.features[1]).toBe(feature);
    });
  });

  it('intializes correctly', () => {
    const store = {
      addReducer: jest.fn(),
    };

    features.init(store);

    expect(store.addReducer).toHaveBeenCalledWith('map_feature', features.reducer);
  });
});
