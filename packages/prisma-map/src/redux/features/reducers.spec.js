import deepFreeze from 'deep-freeze';
import { point, polygon } from '@turf/turf';
import {
  upsertFeature,
  removeFeature,
} from './actions';
import {
  upsertFeatureReducer,
  removeFeatureReducer,
} from './reducers';

describe('redux/features/reducers', () => {
  describe('upsertFeatureReducer', () => {
    it('inserts new feature into empty list', () => {
      const previousState = {};
      const feature = point([-100, 37]);
      feature.id = 'feature1';
      const action = upsertFeature(feature);
      deepFreeze(previousState);

      const newState = upsertFeatureReducer(previousState, action);

      expect(newState).toEqual({
        feature1: feature,
      });
    });

    it('replaces existing feature', () => {
      const feature = point([-100, 37]);
      const newFeature = point([10, -12]);
      feature.id = 'feature1';
      newFeature.id = 'feature1';
      const action = upsertFeature(newFeature);
      const previousState = { feature1: feature };
      deepFreeze(previousState);

      const newState = upsertFeatureReducer(previousState, action);

      expect(newState).toEqual({
        feature1: newFeature,
      });
    });

    it('ignores features with no ID', () => {
      const feature = point([-100, 37]);
      const action = upsertFeature(feature);
      const previousState = {};
      deepFreeze(previousState);

      const newState = upsertFeatureReducer(previousState, action);

      expect(newState).toEqual(previousState);
    });

    it('doesnt override existing features with different ID', () => {
      const feature = point([-100, 37]);
      const newFeature = point([10, -12]);
      feature.id = 'feature1';
      newFeature.id = 'feature2';
      const action = upsertFeature(newFeature);
      const previousState = { feature1: feature };
      deepFreeze(previousState);

      const newState = upsertFeatureReducer(previousState, action);

      expect(newState).toEqual({
        feature1: feature,
        feature2: newFeature,
      });
    });
  });

  describe('removeFeatureReducer', () => {
    it('doesnt nothing when features are empty', () => {
      const previousState = {};
      const feature = point([-100, 37]);
      feature.id = 'feature1';
      const action = removeFeature(feature);
      deepFreeze(previousState);

      const newState = removeFeatureReducer(previousState, action);

      expect(newState).toEqual(previousState);
    });

    it('removes existing feature', () => {
      const feature = polygon([[[-100, 37], [-101, 37], [-101, 40], [-100, 37]]]);
      feature.id = 'feature1';
      const action = removeFeature(feature);
      const previousState = { feature1: feature };
      deepFreeze(previousState);

      const newState = removeFeatureReducer(previousState, action);

      expect(newState).toEqual({});
    });

    it('ignores features with no ID', () => {
      const feature = point([-100, 37]);
      const action = upsertFeature(feature);
      const previousState = { feature: { ...feature, id: 'foo' } };
      deepFreeze(previousState);

      const newState = removeFeatureReducer(previousState, action);

      expect(newState).toEqual(previousState);
    });

    it('doesnt delete existing features with different ID', () => {
      const feature1 = point([-100, 37]);
      const feature2 = point([10, -12]);
      feature1.id = 'feature1';
      feature2.id = 'feature2';
      const action = removeFeature(feature1);
      const previousState = { feature1, feature2 };
      deepFreeze(previousState);

      const newState = removeFeatureReducer(previousState, action);

      expect(newState).toEqual({ feature2 });
    });
  });
});
