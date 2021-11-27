import { TestScheduler } from 'rxjs/testing';
import { point } from '@turf/turf';
import { addFeatureEpic, removeFeatureEpic } from './epics';
import {
  addFeature,
  upsertFeature,
  featureLeftGeoRange,
  timeoutFeature,
  removeFeature,
} from './actions';
import { requestMapStyleUpdate } from '../map/actions';

describe('redux/features/epics', () => {
  let testScheduler = null;
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('addFeatureEpic', () => {
    it('dispatches upsertFeature() on addFeature', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const feature = point([100, 54]);

        const action$ = hot('-a', {
          a: addFeature(feature),
        });

        const output$ = addFeatureEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: upsertFeature(feature),
          b: requestMapStyleUpdate(),
        });
      });
    });

    it('doesnt dispatch anything is a different action is dispatched', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const feature = point([100, 54]);

        const action$ = hot('-a', {
          a: upsertFeature(feature),
        });

        const output$ = addFeatureEpic(action$);

        expectObservable(output$).toBe('--', {});
      });
    });
  });

  describe('removeFeaturesEpic', () => {
    it('dispatches removeFeature() on timeoutFeature', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const feature = point([100, 54]);

        const action$ = hot('-a', {
          a: timeoutFeature(feature),
        });

        const output$ = removeFeatureEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: removeFeature(feature),
          b: requestMapStyleUpdate(),
        });
      });
    });

    it('dispatches removeFeature() on featureLeftGeoRange', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const feature = point([100, 54]);

        const action$ = hot('-a', {
          a: featureLeftGeoRange(feature),
        });

        const output$ = removeFeatureEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: removeFeature(feature),
          b: requestMapStyleUpdate(),
        });
      });
    });

    it('doesnt dispatch anything is a different action is dispatched', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const feature = point([100, 54]);

        const action$ = hot('-a', {
          a: upsertFeature(feature),
        });

        const output$ = removeFeatureEpic(action$);

        expectObservable(output$).toBe('--', {});
      });
    });
  });
});
