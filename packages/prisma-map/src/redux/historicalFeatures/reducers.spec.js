import deepFreeze from 'deep-freeze';
import { point } from '@turf/turf';
import { addHistoryFeature, clearAllHistoryFeatures } from './actions';
import {
  addHistoryFeatureReducer,
  clearAllHistoryFeaturesReducer,
} from './reducers';

describe('redux/historicalFeatures/reducers', () => {
  const exampleFeature = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [103.85564166666667, 1.2571583333333334] },
    properties: {
      crs: 'EPSG:4326',
      databaseId: '5b4370fdd680052061a98081',
      metadata: { name: 'GALLANT', shipAndCargoType: 156 },
      registryId: 'f1b00fa64c8da236512b52fe61f8c6af',
      target: {
        course: 65.8,
        heading: 0,
        mmsi: '563546000',
        navigationalStatus: 0,
        rateOfTurn: 0,
        speed: 7.5,
        time: '2018-07-09T14:28:13.838070429Z',
      },
      trackId: '098fb0bf58c76593dde4892922e0c318',
      type: 'track:AIS',
    },
    id: 'sec:1531146493:ctr:29:site:1:eid:54000',
  };

  describe('addHistoryFeatureReducer', () => {
    it('inserts new feature into empty list', () => {
      const previousState = {};
      deepFreeze(previousState);
      const action = addHistoryFeature(exampleFeature);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toEqual({
        'sec:1531146493:ctr:29:site:1:eid:54000': {
          '2018-07-09T14:28:13.838070429Z': { ...exampleFeature },
        },
      });
    });

    it('inserts feature with time on properties', () => {
      const feature = point([0, 0]);
      feature.id = 'foo';
      feature.properties.time = '123456';

      const previousState = {};
      deepFreeze(previousState);
      const action = addHistoryFeature(feature);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toEqual({
        foo: {
          123456: { ...feature },
        },
      });
    });

    it('inserts feature with time on target', () => {
      const feature = point([0, 0]);
      feature.id = 'foo';
      feature.properties.target = { time: '654321' };

      const previousState = {};
      deepFreeze(previousState);
      const action = addHistoryFeature(feature);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toEqual({
        foo: {
          654321: { ...feature },
        },
      });
    });

    it('inserts feature using properties time over target time', () => {
      const feature = point([0, 0]);
      feature.id = 'foo';
      feature.properties.time = '123456';
      feature.properties.target = { time: '654321' };

      const previousState = {};
      deepFreeze(previousState);
      const action = addHistoryFeature(feature);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toEqual({
        foo: {
          123456: { ...feature },
        },
      });
    });

    it('replaces existing feature', () => {
      const feature = point([-100, 37]);
      const newFeature = point([10, -12]);
      feature.id = 'feature1';
      feature.properties.time = 1234;
      newFeature.id = 'feature1';
      newFeature.properties.time = 1234;
      const action = addHistoryFeature(newFeature);
      const previousState = {
        feature1: {
          1234: feature,
        },
      };
      deepFreeze(previousState);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toEqual({
        feature1: {
          1234: newFeature,
        },
      });
    });

    it('ignores features with no ID', () => {
      const feature = point([-100, 37]);
      const action = addHistoryFeature(feature);
      const previousState = {};
      deepFreeze(previousState);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toEqual(previousState);
    });

    it('doesnt override existing features with different ID', () => {
      const feature = point([-100, 37]);
      const newFeature = point([10, -12]);
      feature.id = 'feature1';
      feature.properties.time = 124;
      newFeature.id = 'feature2';
      newFeature.properties.time = 456;
      const action = addHistoryFeature(newFeature);
      const previousState = {
        feature1: {
          124: feature,
        },
      };
      deepFreeze(previousState);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toEqual({
        feature1: {
          124: feature,
        },
        feature2: {
          456: newFeature,
        },
      });
    });

    it('returns original state if timestamp cannot be found', () => {
      const feature = point([-100, 37]);
      feature.id = 'feature1';

      const action = addHistoryFeature(feature);
      const previousState = { };
      deepFreeze(previousState);

      const newState = addHistoryFeatureReducer(previousState, action);

      expect(newState).toBe(previousState);
    });
  });

  describe('clearAllHistoryFeatureReducer', () => {
    it('removes all elements and returns empty state', () => {
      const action = clearAllHistoryFeatures();
      const prevState = {
        foo: {
          12345: { type: 'Feature' },
        },
      };

      const newState = clearAllHistoryFeaturesReducer(action, prevState);
      expect(newState).toEqual({});
    });

    it('no errors when state is already empty', () => {
      const action = clearAllHistoryFeatures();
      const newState = clearAllHistoryFeaturesReducer(action, {});
      expect(newState).toEqual({});
    });
  });
});
