import { polygon, point } from '@turf/turf';
import { featureProperty, featureType, runLayerFilter } from './filters';

describe('redux/map/filter', () => {
  describe('runLayerFilter()', () => {
    it('runs single filter', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = ['featureProperty', '==', 'foo', 'bar'];

      expect(runLayerFilter(feature, filter)).toBe(true);
    });

    it('runs single failing filter', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'baz',
      };

      const filter = ['featureProperty', '==', 'foo', 'bar'];

      expect(runLayerFilter(feature, filter)).toBe(false);
    });

    it('returns true when filter is empty', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = [];

      expect(runLayerFilter(feature, filter)).toBe(true);
    });

    it('all filter that passes', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = [
        'all',
        ['featureProperty', '==', 'foo', 'bar'],
        ['featureType', 'Point'],
      ];

      expect(runLayerFilter(feature, filter)).toBe(true);
    });

    it('all filter with failure', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = [
        'all',
        ['featureProperty', '==', 'foo', 'bar'],
        ['featureType', 'Polygon'],
      ];

      expect(runLayerFilter(feature, filter)).toBe(false);
    });

    it('any filter with all filters true', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = [
        'any',
        ['featureProperty', '==', 'foo', 'bar'],
        ['featureType', 'Point'],
      ];

      expect(runLayerFilter(feature, filter)).toBe(true);
    });

    it('any filter with all filters false', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = [
        'any',
        ['featureProperty', '==', 'foo', 'notbar'],
        ['featureType', 'Polygon'],
      ];

      expect(runLayerFilter(feature, filter)).toBe(false);
    });

    it('any filter with some filters false', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = [
        'any',
        ['featureProperty', '==', 'foo', 'notbar'],
        ['featureType', 'Point'],
      ];

      expect(runLayerFilter(feature, filter)).toBe(true);
    });

    it('returns false when an unknown filter is passed in', () => {
      const feature = point([0, 0]);
      feature.properties = {
        foo: 'bar',
      };

      const filter = [
        'unknownfilter', '==', 'foo', 'notbar',
      ];

      expect(runLayerFilter(feature, filter)).toBe(false);
    });
  });

  describe('featureProperty()', () => {
    it('returns true when filter is feature.foo == bar and foo is bar', () => {
      const feature = {
        properties: {
          foo: 'bar',
        },
      };

      expect(featureProperty(feature, '==', 'foo', 'bar')).toBe(true);
    });

    it('returns false when filter is feature.foo == bar and foo is not bar', () => {
      const feature = {
        properties: {
          foo: 'notbar',
        },
      };

      expect(featureProperty(feature, '==', 'foo', 'bar')).toBe(false);
    });

    it('returns false when filter is feature.foo == bar and foo is not a property', () => {
      const feature = { properties: {} };

      expect(featureProperty(feature, '==', 'foo', 'bar')).toBe(false);
    });

    it('returns false when filter is feature.foo == bar and there are no properties', () => {
      const feature = { };

      expect(featureProperty(feature, '==', 'foo', 'bar')).toBe(false);
    });

    it('returns true when filter is feature.foo != bar and foo is not bar', () => {
      const feature = {
        properties: {
          foo: 'notbar',
        },
      };

      expect(featureProperty(feature, '!=', 'foo', 'bar')).toBe(true);
    });

    it('returns false when filter is feature.foo != bar and foo is bar', () => {
      const feature = {
        properties: {
          foo: 'bar',
        },
      };

      expect(featureProperty(feature, '!=', 'foo', 'bar')).toBe(false);
    });

    it('returns true when filter is feature.foo < 10 and foo is 5', () => {
      const feature = {
        properties: {
          foo: 5,
        },
      };

      expect(featureProperty(feature, '<', 'foo', 10)).toBe(true);
    });

    it('returns false when filter is feature.foo < 10 and foo is 11', () => {
      const feature = {
        properties: {
          foo: 11,
        },
      };

      expect(featureProperty(feature, '<', 'foo', 10)).toBe(false);
    });

    it('returns true when filter is feature.foo > 10 and foo is 15', () => {
      const feature = {
        properties: {
          foo: 15,
        },
      };

      expect(featureProperty(feature, '>', 'foo', 10)).toBe(true);
    });

    it('returns false when filter is feature.foo > 10 and foo is 5', () => {
      const feature = {
        properties: {
          foo: 5,
        },
      };

      expect(featureProperty(feature, '>', 'foo', 10)).toBe(false);
    });

    it('returns true when filter is feature.foo >= 10 and foo is 10', () => {
      const feature = {
        properties: {
          foo: 10,
        },
      };

      expect(featureProperty(feature, '>=', 'foo', 10)).toBe(true);
    });

    it('returns true when filter is feature.foo >= 10 and foo is 11', () => {
      const feature = {
        properties: {
          foo: 11,
        },
      };

      expect(featureProperty(feature, '>=', 'foo', 10)).toBe(true);
    });

    it('returns false when filter is feature.foo >= 10 and foo is 9', () => {
      const feature = {
        properties: {
          foo: 9,
        },
      };

      expect(featureProperty(feature, '>=', 'foo', 10)).toBe(false);
    });

    it('returns true when filter is feature.foo <= 10 and foo is 10', () => {
      const feature = {
        properties: {
          foo: 10,
        },
      };

      expect(featureProperty(feature, '<=', 'foo', 10)).toBe(true);
    });

    it('returns true when filter is feature.foo <= 10 and foo is 9', () => {
      const feature = {
        properties: {
          foo: 9,
        },
      };

      expect(featureProperty(feature, '<=', 'foo', 10)).toBe(true);
    });

    it('returns false when filter is feature.foo <= 10 and foo is 11', () => {
      const feature = {
        properties: {
          foo: 11,
        },
      };

      expect(featureProperty(feature, '<=', 'foo', 10)).toBe(false);
    });

    it('invalid operator returns false', () => {
      const feature = {
        properties: {
          foo: 11,
        },
      };

      expect(featureProperty(feature, 'kldkdkd', 'foo', 10)).toBe(false);
    });
  });

  describe('featureType()', () => {
    it('returns true when feature type is Polygon', () => {
      const feature = polygon([[[0, 0], [0, 1], [1, 0], [0, 0]]]);

      expect(featureType(feature, 'Polygon')).toBe(true);
    });

    it('returns false when feature type is not Polygon', () => {
      const feature = point([0, 0]);

      expect(featureType(feature, 'Polygon')).toBe(false);
    });

    it('returns true when feature type is Point', () => {
      const feature = point([0, 0]);

      expect(featureType(feature, 'Point')).toBe(true);
    });

    it('returns false when feature type is not Point', () => {
      const feature = polygon([[[0, 0], [0, 1], [1, 0], [0, 0]]]);

      expect(featureType(feature, 'Point')).toBe(false);
    });

    it('returns false when not a valid feature', () => {
      const feature = {};

      expect(featureType(feature, 'Point')).toBe(false);
    });
  });
});
