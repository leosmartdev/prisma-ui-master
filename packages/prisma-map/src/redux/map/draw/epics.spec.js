import { TestScheduler } from 'rxjs/testing';
import { startDrawModeEpic, stopDrawModeEpic } from './epics';
import { setMapMode } from '../actions';
import {
  startDrawMode,
  stopDrawMode,
  changeDrawTool,
} from './actions';

describe('redux/map/draw/epics', () => {
  let testScheduler = null;
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('startDrawModeEpic', () => {
    it('dispatches setMapMode and change Draw Tool on startDrawMode', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: startDrawMode('map1'),
        });

        const output$ = startDrawModeEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: setMapMode('map1', 'draw'),
          b: changeDrawTool('map1', 'select'),
        });
      });
    });
  });

  describe('stoprawModeEpic', () => {
    it('dispatches setMapMap on stopDrawMode', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: stopDrawMode('map1'),
        });

        const output$ = stopDrawModeEpic(action$);

        expectObservable(output$).toBe('-a', {
          a: setMapMode('map1', 'normal'),
        });
      });
    });
    // TODO feature and layer add to get zones into draw mode.
  });
});
