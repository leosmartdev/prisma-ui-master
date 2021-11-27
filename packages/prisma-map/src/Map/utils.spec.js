import { randomPolygon } from '@turf/turf';
import { getFirstFeature } from './utils';

describe('Map/utils', () => {
  describe('getFirstFeature', () => {
    it('returns null when features is undefined', () => {
      expect(getFirstFeature()).toBeNull();
    });

    it('returns null when features list is empty', () => {
      expect(getFirstFeature([])).toBeNull();
    });

    it('returns first feature', () => {
      const collection = randomPolygon(1);
      expect(getFirstFeature(collection.features)).toBe(collection.features[0]);
    });

    it('returns first feature of many', () => {
      const collection = randomPolygon(10);
      expect(getFirstFeature(collection.features)).toBe(collection.features[0]);
    });
  });
});
